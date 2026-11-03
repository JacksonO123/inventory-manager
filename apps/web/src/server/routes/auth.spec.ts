/**
 * @jest-environment node
 */
import { basicAuthRoute } from './auth';
import { BasicUser } from '../model/BasicUser';

jest.mock('../model/BasicUser', () => ({
  BasicUser: { create: jest.fn(), getByEmail: jest.fn() }
}));

const route = basicAuthRoute as any;

describe('basicAuthRoute.createUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('creates the user and returns their id', async () => {
    const body = { name: 'Ben', email: 'ben@x.com' };
    (BasicUser.create as jest.Mock).mockResolvedValue('u1');

    await expect(route.createUser({ body })).resolves.toEqual({
      status: 200,
      body: { id: 'u1' }
    });
    expect(BasicUser.create).toHaveBeenCalledWith(body);
  });

  it('returns 500 when creating the user throws, e.g. a duplicate', async () => {
    (BasicUser.create as jest.Mock).mockRejectedValue(new Error('duplicate key'));

    await expect(route.createUser({ body: { email: 'ben@x.com' } })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: duplicate key' }
    });
  });
});

describe('basicAuthRoute.getUser', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('returns the user with that email', async () => {
    const user = { id: 'u1', email: 'ben@x.com' };
    (BasicUser.getByEmail as jest.Mock).mockResolvedValue(user);

    await expect(route.getUser({ query: { email: 'ben@x.com' } })).resolves.toEqual({
      status: 200,
      body: { user }
    });
    expect(BasicUser.getByEmail).toHaveBeenCalledWith('ben@x.com');
  });

  it('returns 200 with no user when nobody has that email', async () => {
    (BasicUser.getByEmail as jest.Mock).mockResolvedValue(undefined);

    await expect(route.getUser({ query: { email: 'ghost@x.com' } })).resolves.toEqual({
      status: 200,
      body: { user: undefined }
    });
  });

  it('returns 500 when the lookup throws', async () => {
    (BasicUser.getByEmail as jest.Mock).mockRejectedValue(new Error('db down'));

    await expect(route.getUser({ query: { email: 'ben@x.com' } })).resolves.toEqual({
      status: 500,
      body: { message: 'Error: db down' }
    });
  });
});
