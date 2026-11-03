import { useMousePosition } from '../../../hooks/useMousePosition';
import { Org as OrgType } from '../../../types/types';
import { Org } from './Org';

type OrgDragGhostProps = {
  draggingOrg: OrgType | undefined;
};

const DRAG_N_OFFSET_X = 20;
const DRAG_N_OFFSET_Y = 42;

export function OrgDragGhost({ draggingOrg }: OrgDragGhostProps) {
  const mousePos = useMousePosition();

  return (
    draggingOrg !== undefined && (
      <div
        className="fixed"
        style={{
          top: mousePos.y - DRAG_N_OFFSET_Y,
          left: mousePos.x - DRAG_N_OFFSET_X,
          pointerEvents: 'none'
        }}
      >
        <Org
          className="bg-card/60 backdrop-blur-xs"
          org={draggingOrg}
          editable={true}
          onDelete={() => {}}
          onEntryDragStart={() => {}}
          onEntryDragEnd={() => {}}
          onEntryHover={() => {}}
          onEditClick={() => {}}
        />
      </div>
    )
  );
}
