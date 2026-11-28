import { errorMsgSchema } from './common';

describe('errorMsgSchema', () => {
  it('parses a message', () => {
    expect(errorMsgSchema.parse({ message: 'boom' })).toEqual({ message: 'boom' });
  });

  it('rejects an empty message', () => {
    expect(errorMsgSchema.safeParse({ message: '' }).success).toBe(false);
  });

  it('rejects a missing message', () => {
    expect(errorMsgSchema.safeParse({}).success).toBe(false);
  });
});
