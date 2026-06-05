# Markdown + Remark Plugin Pattern

> **What this is:** A teaching document for the pattern used in
> `hub/client/src/components/Markdown.tsx` — how a custom remark plugin rewrites
> mdast nodes, and how a `react-markdown` `components` override renders those
> rewritten nodes as custom React components.

## Contents

1. [What & why](#1-what--why)
2. [Background: mdast and the remark/rehype pipeline](#2-background-mdast-and-the-remarkrehype-pipeline)
3. [The concrete example: `remarkArtifactLinks` (SPEC-uic-014)](#3-the-concrete-example-remarkartifactlinks-spec-uic-014)
4. [Why AST, not string surgery](#4-why-ast-not-string-surgery)
5. [How it generalizes — TGT-112 projection comments](#5-how-it-generalizes--tgt-112-projection-comments)
6. [Gotchas & checklist](#6-gotchas--checklist)

---

## 1. What & why

The Hub renders artifact markdown through a single shared `<Markdown>` component
(SPEC-uic-013). That shared component wraps `react-markdown` with `remark-gfm` so
GitHub-Flavored Markdown features — tables, strikethrough, task lists — work
everywhere, and raw HTML stays disabled for safety.

Centralising markdown rendering in one place means that cross-cutting concerns —
like linkifying artifact IDs in body text (SPEC-uic-014) — can be added once and
apply to every screen automatically. The mechanism for doing that is a **remark
plugin**: a function that receives the markdown AST (mdast) and can walk and
rewrite it before `react-markdown` turns it into React elements. Paired with a
`components` override that maps custom node shapes to custom React components, the
plugin makes body-text rewrites completely invisible to the call sites.

---

## 2. Background: mdast and the remark/rehype pipeline

When `react-markdown` parses a markdown string, it passes through two
transformation layers before producing DOM:

```
Markdown string
  → remark parses → mdast  (Markdown AST: paragraphs, headings, text nodes …)
  → remark plugins run on mdast
  → rehype converts to hast  (HTML AST: div, p, a …)
  → rehype plugins run on hast
  → React renders hast → DOM
```

**Remark plugins** run early, on mdast, before anything is HTML. A plugin is a
function that returns a `transform(tree)` function — it receives the root
`GenericNode` and can mutate the tree in place.

mdast node shapes that matter here:

| Node type    | What it is                          | Has `children`? |
| ------------ | ----------------------------------- | --------------- |
| `text`       | A run of plain text                 | No (leaf)       |
| `link`       | An `[anchor](url)` link             | Yes — text nodes |
| `inlineCode` | A `` `backtick` `` span             | No (leaf)       |
| `code`       | A fenced or indented code block     | No (leaf)       |
| `paragraph`  | A block of phrasing content         | Yes             |

`text` nodes carry a `position` field — `{ start: { line, column }, end: … }` —
which records where in the source document the text came from. That line number is
useful when you want to match a comment to a specific line of rendered output
(see Section 5).

---

## 3. The concrete example: `remarkArtifactLinks` (SPEC-uic-014)

SPEC-uic-014 says: artifact IDs (`TGT-`, `SPEC-`, `GAP-`, `WI-`, `ISS-`, `IMP-`)
found in markdown body text should auto-render as links that open the
`ArtifactPeeker`. IDs inside code spans/blocks must **not** be linkified.

The implementation lives in `Markdown.tsx` and has three cooperating pieces.

### 3a. The regex

```ts
// hub/client/src/components/Markdown.tsx:27
const ARTIFACT_ID_RE = /\b(TGT|SPEC|GAP|WI|ISS|IMP)(-[A-Za-z0-9]+)+\b/g;
```

Matches single-segment IDs (`TGT-001`, `ISS-005`) and multi-segment ones
(`SPEC-uic-014`, `GAP-uic-001`). The `\b` word boundaries prevent partial matches.

### 3b. The remark plugin — `remarkArtifactLinks`

```ts
// hub/client/src/components/Markdown.tsx:34-38
function remarkArtifactLinks() {
  return function transform(tree: GenericNode) {
    walkNode(tree);
  };
}
```

`walkNode` descends into any node that has `children`. For each child:

- If it is a `text` node, call `splitTextNode` and replace the single child with
  the returned mix of `text` and `link` nodes.
- If it is `inlineCode` or `code`, skip recursing into it (these nodes have no
  `text` children in mdast anyway — their content is in `value`, not `children` —
  so the guard is belt-and-suspenders).
- Otherwise recurse.

```ts
// hub/client/src/components/Markdown.tsx:40-67 (trimmed)
function walkNode(node: GenericNode): void {
  if (!node.children) return;

  const newChildren: PhrasingNode[] = [];
  let changed = false;

  for (const child of node.children) {
    if (child.type === 'text') {
      const rewritten = splitTextNode(child as TextNode);
      if (rewritten.length === 1 && rewritten[0] === child) {
        newChildren.push(child);
      } else {
        changed = true;
        for (const n of rewritten) newChildren.push(n);
      }
    } else {
      newChildren.push(child);
      if (child.type !== 'inlineCode' && child.type !== 'code') {
        walkNode(child as GenericNode);
      }
    }
  }

  if (changed) node.children = newChildren;
}
```

`splitTextNode` scans the text value with the regex and alternates between
producing plain `text` nodes (the gaps between matches) and `link` nodes (the
matches):

```ts
// hub/client/src/components/Markdown.tsx:73-104 (trimmed)
function splitTextNode(node: TextNode): Array<TextNode | LinkNode> {
  const regex = new RegExp(ARTIFACT_ID_RE.source, 'g');
  const result: Array<TextNode | LinkNode> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(node.value)) !== null) {
    const id = match[0];
    if (match.index > lastIndex) {
      result.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
    }
    result.push({
      type: 'link',
      url: `artifact:${id}`,       // <-- sentinel URL
      children: [{ type: 'text', value: id }],
    });
    lastIndex = match.index + id.length;
  }

  if (result.length === 0) return [node];  // no matches — return original unchanged

  if (lastIndex < node.value.length) {
    result.push({ type: 'text', value: node.value.slice(lastIndex) });
  }
  return result;
}
```

After this runs, a paragraph like `"See TGT-001 for context."` becomes three
mdast nodes in the paragraph's `children`:

```
text("See ")
link(url="artifact:TGT-001") → [text("TGT-001")]
text(" for context.")
```

### 3c. The sentinel URL and `urlTransform`

`react-markdown` sanitizes URLs by default — it strips any protocol it does not
recognise. The custom `urlTransform` passes `artifact:` URLs through unchanged
while delegating everything else to `defaultUrlTransform`:

```ts
// hub/client/src/components/Markdown.tsx:110-113
function urlTransform(url, key, node) {
  if (url.startsWith('artifact:')) return url;
  return defaultUrlTransform(url, key, node);
}
```

Without this, the `artifact:TGT-001` URL would be stripped to an empty string
and the `components.a` override would never see it.

### 3d. The `components.a` override

`react-markdown` calls the `components.a` renderer for every mdast `link` node.
The override checks the `href` — if it starts with `artifact:`, it strips the
prefix and renders `<ArtifactIdLink id={...} />` instead of a plain `<a>`:

```ts
// hub/client/src/components/Markdown.tsx:124-135
components={{
  a({ href, children: linkChildren, ...props }) {
    if (href && href.startsWith('artifact:')) {
      const id = href.slice('artifact:'.length);
      return <ArtifactIdLink id={id} />;
    }
    return <a href={href} {...props}>{linkChildren}</a>;
  },
}}
```

### 3e. `ArtifactIdLink` and `PeekerContext`

`ArtifactIdLink` (SPEC-uic-012) renders a `<button>` that calls `openPeeker` from
`PeekerContext` on click:

```ts
// hub/client/src/components/ArtifactIdLink.tsx:40-51 (trimmed)
export function ArtifactIdLink({ id, className }) {
  const { openPeeker } = usePeeker();
  const kind = PREFIX_TO_KIND[prefixOf(id)];

  if (!kind) return <span className={className}>{id}</span>;  // plain-text fallback

  return (
    <button
      className="artifact-id-link"
      onClick={(e) => { e.stopPropagation(); openPeeker(id, kind); }}
      title={`Peek ${id}`}
    >
      {id}
    </button>
  );
}
```

`PeekerContext` holds `{ peeker: { id, kind } | null, openPeeker, closePeeker }`
as a single app-level React context (SPEC-uic-011). Any component can call
`openPeeker` to show the peeker overlay; no prop-drilling needed.

### 3f. End-to-end flow summary

```
Markdown string: "See TGT-001 for context."

  remark parses → paragraph[text("See TGT-001 for context.")]

  remarkArtifactLinks runs →
    paragraph[text("See "), link(artifact:TGT-001)[text("TGT-001")], text(" for context.")]

  react-markdown renders link node → calls components.a
    href = "artifact:TGT-001"  → renders <ArtifactIdLink id="TGT-001" />

  <ArtifactIdLink> → <button onClick={() => openPeeker("TGT-001", "TGT")}>TGT-001</button>

  User clicks → PeekerContext.openPeeker → ArtifactPeeker overlay appears
```

---

## 4. Why AST, not string surgery

Doing a global regex replace on the raw markdown string is tempting but brittle:

- A replacement like `` `SPEC-uic-014` `` (inline code) would still match and be
  rewritten, corrupting the markdown source before parsing.
- A replacement inside a fenced code block would corrupt the block.
- Replacing text that is already inside a `[link](url)` would double-nest links.

Operating on mdast nodes avoids all of these:

- `code` and `inlineCode` nodes simply never reach `walkNode`'s text-splitting
  branch — their content is in `value`, not in `children`. The plugin loop
  explicitly skips recursing into them.
- Existing `link` nodes are passed through unchanged; the plugin only splits bare
  `text` nodes.
- No risk of corrupting markdown syntax, because the AST was already parsed
  correctly before the plugin runs.

The tests confirm this: an ID inside `` `backtick` `` or a fenced block produces
zero `button.artifact-id-link` elements but still appears as plain text inside
the `<code>` element (`Markdown.test.tsx:79-99`).

---

## 5. How it generalizes — TGT-112 projection comments

The same two-part pattern — **remark plugin rewrites mdast nodes** + **components
override renders the custom node shape** — can be applied to any "enrich markdown
content" feature. TGT-112 (projection comments) is the next planned use.

The idea: a `comments` prop on `<Markdown>` carries an array of comment objects,
each with a `selectedText` (the exact words the user highlighted) and a `line`
(the source-document line where the selection starts). A remark plugin matches
each comment to the mdast node at that line and wraps the matching text in a
custom highlight node. The `components` override renders that node as a `<mark>`
with a hover tooltip.

### 5a. The plugin skeleton

```ts
interface Comment {
  id: string;
  selectedText: string;
  line: number;         // 1-based source line from getSelection() + data-sourcepos
  author: string;
  timestamp: string;
}

function remarkComments(comments: Comment[]) {
  return function transform(tree: GenericNode) {
    // Index comments by line for O(1) lookup
    const byLine = new Map<number, Comment[]>();
    for (const c of comments) {
      (byLine.get(c.line) ?? byLine.set(c.line, []).get(c.line)!).push(c);
    }

    visit(tree, 'text', (node: TextNode & { position?: Position }) => {
      const nodeLine = node.position?.start.line;
      const lineComments = nodeLine != null ? (byLine.get(nodeLine) ?? []) : [];

      for (const comment of lineComments) {
        // Find selectedText within this text node's value
        const idx = node.value.indexOf(comment.selectedText);
        if (idx === -1) continue;   // not on this node — plain-text fallback
        // Split: text | highlight | text
        // highlight carries a sentinel type "commentHighlight" and the comment data
        // (In practice: replace node in parent children array, similar to splitTextNode above)
      }
    });
  };
}
```

The critical detail is `node.position?.start.line`. Because remark preserves
source positions through the parse, a text node that originated on line 4 of the
source carries `position.start.line === 4`. Matching on line before matching on
`selectedText` confines the search to the right paragraph even when the same
words appear elsewhere.

### 5b. The highlight node shape

Rather than inventing a new mdast node type (which would require a custom plugin
for the rehype bridge), the simplest approach is to keep it a `link` node with
a sentinel URL — exactly like `artifact:`:

```ts
// Inside splitTextNodeForComments:
result.push({
  type: 'link',
  url: `comment:${comment.id}`,
  children: [{ type: 'text', value: comment.selectedText }],
});
```

Or, if you want a richer mdast shape, use an `html` leaf node with a sentinel
marker string and let the `components` override intercept it. The sentinel-URL
approach is simpler because it reuses the `components.a` override path and avoids
having to teach rehype about a new node type.

### 5c. The `components.a` extension

```ts
components={{
  a({ href, children: linkChildren, ...props }) {
    if (href?.startsWith('artifact:')) {
      return <ArtifactIdLink id={href.slice('artifact:'.length)} />;
    }
    if (href?.startsWith('comment:')) {
      const commentId = href.slice('comment:'.length);
      const comment = comments.find(c => c.id === commentId);
      return (
        <mark
          className="projection-comment"
          title={comment ? `${comment.author} · ${comment.timestamp}` : ''}
        >
          {linkChildren}
          {comment && <sup className="comment-label">{comment.author[0]}</sup>}
        </mark>
      );
    }
    return <a href={href} {...props}>{linkChildren}</a>;
  },
}}
```

### 5d. Capturing selectedText + line (the other side)

The capture side — how the user's selection becomes a `{ selectedText, line }` — 
is separate and small:

1. `window.getSelection()?.toString()` gives the selected text.
2. The nearest ancestor with `data-sourcepos` (which `react-markdown` sets when
   `sourcePos` is enabled, or which you add manually) gives the source line.
3. Together these form the comment object that gets stored and passed back as the
   `comments` prop.

Cross-inline-formatting selection (a selection that starts inside one inline
element and ends inside another) is a best-effort edge case: if `selectedText`
matches across the boundary, neither `splitTextNode` variant will find it in a
single `text` node. The plain-text fallback applies — the highlight is simply
omitted for that comment.

---

## 6. Gotchas & checklist

When implementing this pattern, go through this list:

| # | Concern | What to do |
| - | ------- | ---------- |
| 1 | **Sentinel URL stripped** | Add a `urlTransform` that passes your `foo:` protocol through and delegates all other URLs to `defaultUrlTransform`. |
| 2 | **`components` override not reached** | Confirm `urlTransform` is returning the URL (not `""`) — that is the most common reason `href` arrives as undefined. |
| 3 | **Code spans/blocks linkified** | Only split `text` nodes. Explicitly skip recursing into `inlineCode` and `code` nodes in `walkNode`. |
| 4 | **Line targeting off by one** | mdast `position.start.line` is 1-based. Match it against a 1-based line number from the capture side. |
| 5 | **No match on a line** | Always have a plain-text fallback — return the original node array unchanged if no regex match or selectedText index is found. |
| 6 | **Raw HTML enabled** | Do not add `rehype-raw`. Raw HTML allows script injection. SPEC-uic-013 explicitly forbids it. |
| 7 | **PeekerContext not in scope** | `<ArtifactIdLink>` calls `usePeeker()`, so tests that render `<Markdown>` must wrap in `<PeekerProvider>`. See `Markdown.test.tsx:7-9`. |
| 8 | **Regex global flag reuse** | Always construct a fresh `RegExp` inside `splitTextNode` (or reset `lastIndex`) — sharing a `g`-flagged regex across calls carries state. The implementation does this correctly at line 76. |
