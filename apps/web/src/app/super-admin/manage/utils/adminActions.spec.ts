/**
 * @jest-environment node
 */
import { tsr } from '../../../../server/tsr';
import {
  addAdmin,
  addSuperAdmin,
  demoteSuperAdmin,
  promoteAdmin,
  revokeAdmin,
  revokeSuperAdmin,
  validateAdminEmail,
  validateSuperAdminEmail
} from './adminActions';

jest.mock('../../../../server/tsr', () => ({
  tsr: {
    superAdmin: {
      isValidSuperAdminEmail: { mutate: jest.fn() },
      isValidAdminEmail: { mutate: jest.fn() },
      revokeSuperAdmin: { mutate: jest.fn() },
      addSuperAdmin: { mutate: jest.fn() },
      demote: { mutate: jest.fn() }
    },
    admin: {
      revokeAdmin: { mutate: jest.fn() },
      addAdmin: { mutate: jest.fn() },
      promote: { mutate: jest.fn() }
    }
  }
}));

const mocked = tsr as any;

beforeEach(() => jest.clearAllMocks());

describe('validateSuperAdminEmail', () => {
  const mutate = mocked.superAdmin.isValidSuperAdminEmail.mutate;

  it('calls the api with the email', async () => {
    mutate.mockResolvedValue({ status: 200, body: { status: 'valid' } });

    await validateSuperAdminEmail('a@b.com');

    expect(mutate).toHaveBeenCalledWith({ body: { email: 'a@b.com' } });
  });

  it.each([
    [{ status: 500, body: {} }, 'Validation error'],
    [{ status: 200, body: { status: 'no_user_exists' } }, 'Given email is not an existing user'],
    [{ status: 200, body: { status: 'super_admin_exists' } }, 'Already a super admin'],
    [{ status: 200, body: { status: 'valid' } }, true]
  ])('maps %j to %p', async (res, expected) => {
    mutate.mockResolvedValue(res);

    expect(await validateSuperAdminEmail('a@b.com')).toBe(expected);
  });
});

describe('validateAdminEmail', () => {
  const mutate = mocked.superAdmin.isValidAdminEmail.mutate;

  it('calls the api with the email', async () => {
    mutate.mockResolvedValue({ status: 200, body: { status: 'valid' } });

    await validateAdminEmail('a@b.com');

    expect(mutate).toHaveBeenCalledWith({ body: { email: 'a@b.com' } });
  });

  it.each([
    [{ status: 500, body: {} }, 'Validation error'],
    [{ status: 200, body: { status: 'no_user_exists' } }, 'Given email is not an existing user'],
    [{ status: 200, body: { status: 'admin_exists' } }, 'Already an admin'],
    [{ status: 200, body: { status: 'valid' } }, true]
  ])('maps %j to %p', async (res, expected) => {
    mutate.mockResolvedValue(res);

    expect(await validateAdminEmail('a@b.com')).toBe(expected);
  });
});

describe.each([
  ['revokeSuperAdmin', revokeSuperAdmin, mocked.superAdmin.revokeSuperAdmin.mutate],
  ['revokeAdmin', revokeAdmin, mocked.admin.revokeAdmin.mutate],
  ['demoteSuperAdmin', demoteSuperAdmin, mocked.superAdmin.demote.mutate],
  ['promoteAdmin', promoteAdmin, mocked.admin.promote.mutate]
])('%s', (_name, action, mutate) => {
  it('calls the api with the user id and returns success', async () => {
    mutate.mockResolvedValue({ status: 200, body: {} });

    expect(await action('u1')).toEqual({ status: 'success', body: undefined });
    expect(mutate).toHaveBeenCalledWith({ body: { userId: 'u1' } });
  });

  it('returns the message for a 401 or 500', async () => {
    mutate.mockResolvedValue({ status: 401, body: { message: 'nope' } });

    expect(await action('u1')).toEqual({ status: 'error', error: 'nope' });
  });

  it('returns a bare error for other statuses', async () => {
    mutate.mockResolvedValue({ status: 404 });

    expect(await action('u1')).toEqual({ status: 'error' });
  });
});

describe.each([
  ['addSuperAdmin', addSuperAdmin, mocked.superAdmin.addSuperAdmin.mutate],
  ['addAdmin', addAdmin, mocked.admin.addAdmin.mutate]
])('%s', (_name, action, mutate) => {
  it('calls the api with the email and returns the new user id', async () => {
    mutate.mockResolvedValue({ status: 200, body: { userId: 'u1' } });

    expect(await action('a@b.com')).toEqual({ status: 'success', body: { userId: 'u1' } });
    expect(mutate).toHaveBeenCalledWith({ body: { email: 'a@b.com' } });
  });

  it('returns the message for a 500', async () => {
    mutate.mockResolvedValue({ status: 500, body: { message: 'boom' } });

    expect(await action('a@b.com')).toEqual({ status: 'error', error: 'boom' });
  });
});
