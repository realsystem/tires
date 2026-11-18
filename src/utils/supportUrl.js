/**
 * Only a plain https link may be used for the Support button (never
 * javascript:, data:, http:). A bare address such as "buymeacoffee.com/name"
 * is accepted and gets https:// added.
 */
export function safeSupportUrl(raw) {
  let v = typeof raw === 'string' ? raw.trim() : '';
  if (!v) return null;
  if (!v.includes('://') && /^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(v)) v = `https://${v}`;
  try {
    const u = new URL(v);
    return u.protocol === 'https:' && u.hostname.includes('.') ? u.toString() : null;
  } catch {
    return null;
  }
}
