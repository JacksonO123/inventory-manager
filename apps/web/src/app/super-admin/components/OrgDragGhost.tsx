import { useDragging } from '../../../hooks/use-dragging';
import { useMousePosition } from '../../../hooks/useMousePosition';
import { Org as OrgType } from '../../../types/types';
import { Org } from './Org';

type OrgDragGhostProps = {
  orgs: OrgType[];
};

const DRAG_N_OFFSET_X = 20;
const DRAG_N_OFFSET_Y = 42;

export function OrgDragGhost({ orgs }: OrgDragGhostProps) {
  const mousePos = useMousePosition();
  const { dragging } = useDragging();

  return (
    dragging !== null && (
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
          org={orgs[dragging]!}
          editable={true}
          onDelete={() => {}}
          onUpdate={() => {}}
          onOrgDragStart={() => {}}
        />
      </div>
    )
  );
}
