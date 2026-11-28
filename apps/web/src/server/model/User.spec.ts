/**
 * @jest-environment node
 */
import { User } from './User';
import { fakeDb } from './fake-db';

jest.mock('../db', () => ({ db: require('./fake-db').fakeDb.db }));

const userRow = {
  id: 'u1',
  name: 'Alice',
  email: 'alice@example.com',
  emailVerified: true,
  image: null,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-01T00:00:00Z')
};

afterEach(() => {
  jest.clearAllMocks();
  fakeDb.clear();
});

describe('User.getById', () => {
  it('returns a User when found', async () => {
    fakeDb.queue([userRow]);
    const user = await User.getById('u1');
    expect(user).toBeInstanceOf(User);
    expect(user?.values).toEqual(userRow);
  });

  it('returns undefined when not found', async () => {
    fakeDb.queue([]);
    await expect(User.getById('missing')).resolves.toBeUndefined();
  });
});

describe('User.getByEmail', () => {
  it('returns a User when found', async () => {
    fakeDb.queue([userRow]);
    const user = await User.getByEmail('alice@example.com');
    expect(user?.values).toEqual(userRow);
  });

  it('returns undefined when not found', async () => {
    fakeDb.queue([]);
    await expect(User.getByEmail('missing@example.com')).resolves.toBeUndefined();
  });
});

describe('User.getMembersOfOrgByPath', () => {
  it('maps each row to a User instance', async () => {
    fakeDb.queue([{ user: userRow }]);

    const members = await User.getMembersOfOrgByPath('org1');

    expect(members).toHaveLength(1);
    expect(members[0]).toBeInstanceOf(User);
    expect(members[0]!.values).toEqual(userRow);
  });
});

describe('User.isMemberOfOrgById', () => {
  it('returns true when a membership row exists', async () => {
    fakeDb.queue([{ id: 'u1' }]);
    await expect(User.isMemberOfOrgById('u1', 1)).resolves.toBe(true);
  });

  it('returns false when no membership row exists', async () => {
    fakeDb.queue([]);
    await expect(User.isMemberOfOrgById('u1', 1)).resolves.toBe(false);
  });
});
