import { Admin } from '../../model/Admin';
import { SuperAdmin } from '../../model/SuperAdmin';

export async function isAdminOrSuperAdmin(userId: string) {
  return (await Admin.isAdmin(userId)) || (await SuperAdmin.isSuperAdmin(userId));
}
