import { redirect } from 'next/navigation';
import { ErrorCardPage } from '../../components/ErrorCardPage';
import { tsrFactory } from '../../server/tsr-factory';
import { FaceSlightlyFrowning } from 'lucide-react';

export default async function OrgsPate() {
  const tsr = await tsrFactory();
  const adminStatus = await tsr.user.getAdminStatus.query();

  if (adminStatus.status !== 200) {
    return (
      <ErrorCardPage title="Failed to fetch admin status">
        There was an error while requesting your admin status
      </ErrorCardPage>
    );
  }

  if (adminStatus.body.superAdmin) {
    redirect('/');
  }

  if (adminStatus.body.admin) {
    const orgs = await tsr.organizations.getOrgsForAdmin.query();
    if (orgs.status !== 200) {
      return (
        <ErrorCardPage title="Failed to fetch orgs">
          There was an error while fetching the orgs you belong to
        </ErrorCardPage>
      );
    }

    if (orgs.body.length === 0) {
      return (
        <ErrorCardPage
          icon={<FaceSlightlyFrowning className="size-8" />}
          title="Looks like your not part of any orgs"
        >
          Thats a bummer. Looks like you just might have to wait around. And hope someone helps you
          out. Adds you or something. Well, good luck with that.
        </ErrorCardPage>
      );
    }

    redirect(`/orgs/${orgs.body[0]!.path}`);
  }

  return null;
}
