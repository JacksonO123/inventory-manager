/**
 * @jest-environment node
 */
import { incomingHeadersToHeaders } from './headers';

describe('incomingHeadersToHeaders', () => {
  it('converts a string header', () => {
    const headers = incomingHeadersToHeaders({ 'content-type': 'application/json' });

    expect(headers).toBeInstanceOf(Headers);
    expect(headers.get('content-type')).toBe('application/json');
  });

  it('converts several headers at once', () => {
    const headers = incomingHeadersToHeaders({ host: 'localhost', authorization: 'Bearer abc' });

    expect(headers.get('host')).toBe('localhost');
    expect(headers.get('authorization')).toBe('Bearer abc');
  });

  it('joins an array header into one comma separated value', () => {
    const headers = incomingHeadersToHeaders({ 'set-cookie': ['a=1', 'b=2'] });

    expect(headers.get('set-cookie')).toBe('a=1, b=2');
  });

  it('skips headers whose value is undefined', () => {
    const headers = incomingHeadersToHeaders({ host: 'localhost', cookie: undefined });

    expect(headers.has('cookie')).toBe(false);
    expect(headers.get('host')).toBe('localhost');
  });

  it('returns empty headers for an empty input', () => {
    const headers = incomingHeadersToHeaders({});

    expect([...headers.keys()]).toEqual([]);
  });
});
