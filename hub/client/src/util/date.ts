/** Returns the date portion of an ISO timestamp string ("2026-06-01T10:00:00Z" → "2026-06-01"). */
export function dayOf(iso: string): string {
  return iso.split('T')[0];
}
