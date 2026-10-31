import { errorMsgSchema } from '@invm/api-contracts/schemas';
import { HTTPStatusCode } from '@ts-rest/core';
import { tsr } from '../../../../server/tsr';
import { z } from 'better-auth';
import { IdServerErrorRes, ServerErrorRes } from '../../../../types/types';

export async function validateSuperAdminEmail(email: string): Promise<true | string> {
  const res = await tsr.superAdmin.isValidSuperAdminEmail.mutate({ body: { email } });
  if (res.status !== 200) return 'Validation error';
  if (res.body.status === 'no_user_exists') return 'Given email is not an existing user';
  if (res.body.status === 'super_admin_exists') return 'Already a super admin';

  return true;
}

export async function validateAdminEmail(email: string): Promise<true | string> {
  const res = await tsr.superAdmin.isValidAdminEmail.mutate({ body: { email } });
  if (res.status !== 200) return 'Validation error';
  if (res.body.status === 'no_user_exists') return 'Given email is not an existing user';
  if (res.body.status === 'admin_exists') return 'Already an admin';

  return true;
}

type TsrResult =
  | { status: 500 | 401; body: z.infer<typeof errorMsgSchema> }
  | { status: 200; body: unknown }
  | { status: Exclude<HTTPStatusCode, 200 | 401 | 500>; body?: unknown };

type SuccessBody<Res> = Extract<Res, { status: 200 }> extends { body: infer B } ? B : never;

function tsrResultToErrorRes<Res extends TsrResult>(res: Res): ServerErrorRes<undefined>;
function tsrResultToErrorRes<Res extends TsrResult, Out>(
  res: Res,
  bodyTransform: (body: SuccessBody<Res>) => Out
): ServerErrorRes<Out>;
function tsrResultToErrorRes(
  res: TsrResult,
  bodyTransform?: (body: any) => unknown
): ServerErrorRes<unknown> {
  if (res.status === 500 || res.status === 401) {
    return { status: 'error', error: res.body.message };
  }
  if (res.status !== 200) {
    return { status: 'error' };
  }
  return { status: 'success', body: bodyTransform?.(res.body) };
}

export async function revokeSuperAdmin(userId: string): Promise<ServerErrorRes> {
  const res = await tsr.superAdmin.revokeSuperAdmin.mutate({ body: { userId } });
  return tsrResultToErrorRes(res);
}

export async function revokeAdmin(userId: string): Promise<ServerErrorRes> {
  const res = await tsr.admin.revokeAdmin.mutate({ body: { userId } });
  return tsrResultToErrorRes(res);
}

export async function addSuperAdmin(email: string): Promise<IdServerErrorRes> {
  const res = await tsr.superAdmin.addSuperAdmin.mutate({ body: { email } });
  return tsrResultToErrorRes(res, (body) => ({ userId: body.userId }));
}

export async function addAdmin(email: string): Promise<IdServerErrorRes> {
  const res = await tsr.admin.addAdmin.mutate({ body: { email } });
  return tsrResultToErrorRes(res, (body) => ({ userId: body.userId }));
}

export async function demoteSuperAdmin(userId: string): Promise<ServerErrorRes> {
  const res = await tsr.superAdmin.demote.mutate({ body: { userId } });
  return tsrResultToErrorRes(res);
}

export async function promoteAdmin(userId: string): Promise<ServerErrorRes> {
  const res = await tsr.admin.promote.mutate({ body: { userId } });
  return tsrResultToErrorRes(res);
}
