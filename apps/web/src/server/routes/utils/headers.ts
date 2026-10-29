export function headersFromRawHeaders(rawHeaders: string[]) {
  const headers: [string, string][] = [];

  for (let i = 0; i < rawHeaders.length; i += 2) {
    headers.push([rawHeaders[i]!, rawHeaders[i + 1]!]);
  }

  return new Headers(headers);
}
