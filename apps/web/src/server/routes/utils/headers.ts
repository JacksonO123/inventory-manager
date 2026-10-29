import type { IncomingHttpHeaders } from 'http';

export function incomingHeadersToHeaders(incomingHeaders: IncomingHttpHeaders) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((val) => headers.append(key, val));
    else headers.set(key, value);
  }
  return headers;
}
