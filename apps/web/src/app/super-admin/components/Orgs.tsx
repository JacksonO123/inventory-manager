import { useId, useMemo } from 'react';
import { Org as OrgType } from '../../../types/types';
import { Org, OrgProps } from './Org';
import { OrgDragGhost } from './OrgDragGhost';
import { DraggableItems } from '../../../components/DraggableItems';
import { useDragging } from '../../../hooks/use-dragging';

type DraggableLinkEntryListProps = {
  orgs: OrgType[];
  positions: number[];
  managing: boolean;

  onUpdate: (org: OrgType) => void;
  onDelete: (id: number) => void;
  onReorder: (newPositions: number[]) => void;
};

export function Orgs({
  orgs,
  positions,
  managing,
  onUpdate,
  onDelete,
  onReorder
}: DraggableLinkEntryListProps) {
  const dragId = useId();

  const sortedEntries = useMemo(
    () => orgs.sort((a, b) => positions.indexOf(a.id) - positions.indexOf(b.id)),
    [orgs, positions]
  );

  return (
    <DraggableItems
      positions={positions}
      dragGhost={<OrgDragGhost orgs={orgs} />}
      onReorder={onReorder}
    >
      {sortedEntries.map((org, index) => (
        <DraggableOrg
          org={org}
          editable={managing}
          index={index}
          onDelete={() => onDelete(org.id)}
          onUpdate={onUpdate}
          key={`org-${dragId}-${index}`}
        />
      ))}
    </DraggableItems>
  );
}

type DraggableOrgProps = Omit<OrgProps, 'onOrgDragStart'> & {
  index: number;
};

function DraggableOrg({ org, index, editable, onUpdate, onDelete }: DraggableOrgProps) {
  const { handleStartDragging } = useDragging();

  return (
    <Org
      org={org}
      editable={editable}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onOrgDragStart={() => handleStartDragging(index)}
    />
  );
}
