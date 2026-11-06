import { Fragment, useId, useMemo, useState } from 'react';
import { Org as OrgType } from '../../../types/types';
import { Org } from './Org';
import { PlaceholderOrg } from './PlaceholderOrg';
import { OrgDragGhost } from './OrgDragGhost';

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
  const [dragging, setDragging] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const entriesToRender = useMemo(
    () => orgs.sort((a, b) => positions.indexOf(a.id) - positions.indexOf(b.id)),
    [orgs]
  );

  const orgId = useId();

  function handleStartDragging(id: number, index: number) {
    setDragging(id);
    setDraggingIndex(index);
  }

  function handleEndDragging() {
    if (dragging !== null && draggingIndex !== null) {
      const org = orgs.find((org) => org.id === dragging);

      if (org !== undefined) {
        const orgPosition = positions.indexOf(org.id);

        if (orgPosition !== draggingIndex) {
          const newOrder = [...positions];
          const tempPosition = positions[orgPosition];
          positions[orgPosition] = positions[draggingIndex]!;
          positions[draggingIndex] = tempPosition!;
          onReorder(newOrder);
        }
      }
    }

    setDragging(null);
    setDraggingIndex(null);
  }

  function handleHover(index: number) {
    if (dragging !== null) {
      if (
        draggingIndex === index ||
        (index + 1 === orgs.length - 1 && index + 1 !== draggingIndex)
      ) {
        setDraggingIndex(index + 1);
      } else {
        setDraggingIndex(index);
      }
    }
  }

  function getEntryById(id: number) {
    return orgs.find((item) => item.id === id);
  }

  const draggedItemIndex =
    dragging !== null ? entriesToRender.findIndex((e) => e.id === dragging) : null;

  return (
    <>
      <div className="flex flex-wrap justify-center gap-8 w-full">
        {entriesToRender.map((org, index) => {
          const visualIndex =
            index - (draggedItemIndex !== null && index > draggedItemIndex ? 1 : 0);
          return (
            <Fragment key={`org-${orgId}-${index}`}>
              {visualIndex === draggingIndex && org.id !== dragging && <PlaceholderOrg />}
              <Org
                hidden={org.id === dragging}
                org={org}
                editable={managing}
                onEntryDragStart={(id: number) => handleStartDragging(id, visualIndex)}
                onEntryDragEnd={handleEndDragging}
                onEntryHover={() => handleHover(visualIndex)}
                onDelete={() => {}}
                onEditClick={() => {}}
              />
            </Fragment>
          );
        })}
        {orgs.length > 0 && (draggingIndex ?? -1) >= orgs.length - 1 && <PlaceholderOrg />}
      </div>
      <OrgDragGhost draggingOrg={dragging !== null ? getEntryById(dragging) : undefined} />
    </>
  );
}
