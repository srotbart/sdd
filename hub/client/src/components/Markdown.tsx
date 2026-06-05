import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArtifactIdLink } from './ArtifactIdLink';

// Minimal local type aliases so we don't need an @types/mdast import.
// Only the node shapes used by the plugin are declared here.
interface TextNode {
  type: 'text';
  value: string;
}

interface LinkNode {
  type: 'link';
  url: string;
  children: TextNode[];
}

type PhrasingNode = TextNode | LinkNode | GenericNode;

interface GenericNode {
  type: string;
  children?: PhrasingNode[];
}

// Pattern covering: TGT-001, SPEC-uic-001, GAP-uic-001, WI-uic-001, ISS-001, IMP-001
// Prefix: TGT | SPEC | GAP | WI | ISS | IMP, followed by dash-separated alphanumeric segments
const ARTIFACT_ID_RE = /\b(TGT|SPEC|GAP|WI|ISS|IMP)(-[A-Za-z0-9]+)+\b/g;

/**
 * Remark plugin: rewrites artifact IDs in text nodes into link nodes with
 * an `artifact:<ID>` sentinel URL. Only visits `text` nodes — `code` and
 * `inlineCode` nodes are naturally excluded because they are not `text` in mdast.
 */
function remarkArtifactLinks() {
  return function transform(tree: GenericNode) {
    walkNode(tree);
  };
}

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
      // Recurse into container nodes; skip leaf code nodes (no text children in mdast)
      if (child.type !== 'inlineCode' && child.type !== 'code') {
        walkNode(child as GenericNode);
      }
    }
  }

  if (changed) {
    node.children = newChildren;
  }
}

/**
 * Split a text node on artifact ID matches, producing a mix of `text` and `link` nodes.
 * Returns a single-element array containing the original node when no match is found.
 */
function splitTextNode(node: TextNode): Array<TextNode | LinkNode> {
  const value = node.value;
  const result: Array<TextNode | LinkNode> = [];
  const regex = new RegExp(ARTIFACT_ID_RE.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value)) !== null) {
    const id = match[0];
    const start = match.index;

    if (start > lastIndex) {
      result.push({ type: 'text', value: value.slice(lastIndex, start) });
    }

    result.push({
      type: 'link',
      url: `artifact:${id}`,
      children: [{ type: 'text', value: id }],
    });

    lastIndex = start + id.length;
  }

  if (result.length === 0) return [node];

  if (lastIndex < value.length) {
    result.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return result;
}

/**
 * URL transform that allows the `artifact:` sentinel protocol through,
 * delegating everything else to the default sanitizer.
 */
function urlTransform(url: string, key: string, node: Parameters<typeof defaultUrlTransform>[2]): string {
  if (url.startsWith('artifact:')) return url;
  return defaultUrlTransform(url, key, node);
}

interface MarkdownProps {
  children: string;
}

export function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkArtifactLinks]}
      urlTransform={urlTransform}
      components={{
        a({ href, children: linkChildren, ...props }) {
          if (href && href.startsWith('artifact:')) {
            const id = href.slice('artifact:'.length);
            return <ArtifactIdLink id={id} />;
          }
          return (
            <a href={href} {...props}>
              {linkChildren}
            </a>
          );
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
