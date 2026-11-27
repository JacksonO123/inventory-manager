import { toast } from '../components/ui/toast';
import { tsr } from '../server/tsr';
import { useOrgPositions, useOrgs } from '../stores/orgs';
import { Org, PartialOrg } from '../types/types';
import { tsrErrorMessage } from '../utils/utils';

export function useOrgCrud() {
  const { orgs, setOrgs } = useOrgs();
  const { positions, setPositions } = useOrgPositions();

  async function createOrg(partialOrg: PartialOrg) {
    setOrgs((prev) => [{ ...partialOrg, id: -1 }, ...prev]);
    setPositions((prev) => [-1, ...prev]);

    const res = await tsr.organizations.create.mutate({ body: partialOrg });

    if (res.status !== 200) {
      setOrgs((prev) => prev.filter((item) => item.id !== -1));
      setPositions((prev) => prev.filter((item) => item !== -1));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to add org')
      });
    } else {
      setOrgs((prev) => prev.map((item) => (item.id === -1 ? { ...item, id: res.body.id } : item)));
      setPositions((prev) => prev.map((item) => (item === -1 ? res.body.id : item)));
      toast.add({
        type: 'success',
        title: 'Successfully added org'
      });
    }
  }

  async function setOrgPositions(newOrder: number[]) {
    const prevOrder = [...positions];
    setPositions(newOrder);

    const res = await tsr.organizations.setPositions.mutate({
      body: { positions: newOrder }
    });
    if (res.status !== 200) {
      setPositions(prevOrder);
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to reorder orgs')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully reordered orgs'
      });
    }
  }

  async function deleteOrg(id: number) {
    const prevOrgs = [...orgs];
    setOrgs((prev) => prev.filter((org) => org.id !== id));

    const res = await tsr.organizations.delete.mutate({ body: { id } });
    if (res.status !== 200) {
      setOrgs(prevOrgs);
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to delete org')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully deleted org'
      });
    }
  }

  async function updateOrg(updatedOrg: Org) {
    const prevOrg = orgs.find((org) => org.id === updatedOrg.id);
    if (!prevOrg) return;

    setOrgs((prev) => prev.map((org) => (org.id === updatedOrg.id ? updatedOrg : org)));

    const res = await tsr.organizations.update.mutate({ body: updatedOrg });
    if (res.status !== 200) {
      setOrgs((prev) => prev.map((org) => (org.id === prevOrg.id ? prevOrg : org)));
      toast.add({
        type: 'error',
        title: tsrErrorMessage(res.body, 'Failed to update org')
      });
    } else {
      toast.add({
        type: 'success',
        title: 'Successfully updated org'
      });
    }
  }

  return { createOrg, setOrgPositions, deleteOrg, updateOrg };
}
