import Konva from 'konva';
import { Group, Line, Circle } from 'react-konva';
import { useUpdateWallMutation, useCreateWallMutation } from '../../../api/floorApi';

export const WallLayer = ({ 
  floor, 
  floorId, 
  isWallMode, 
  setSelectedWallId, 
  newWallPoints,
  snap,
  dragBoundFunc,
  stageScale,
  stagePos
}: any) => {
  const [updateWall] = useUpdateWallMutation();
  const [createWall] = useCreateWallMutation();

  return (
    <>
      {floor?.walls?.map((wall: any) => (
        <Group key={`wall-${wall.id}`}>
          <Line
            id={`wall-line-${wall.id}`}
            points={[wall.x1, wall.y1, wall.x2, wall.y2]}
            stroke={wall.isDoor ? "#f59e0b" : "#1f2937"}
            strokeWidth={8}
            hitStrokeWidth={20}
            lineCap="round"
            onClick={(e) => {
              if (isWallMode) {
                e.cancelBubble = true;
                setSelectedWallId(wall.id);
              }
            }}
            onDragStart={(e) => {
              if (isWallMode && e.target instanceof Konva.Line) {
                e.cancelBubble = true;
                e.target.stopDrag();
                const pos = e.target.getStage()?.getPointerPosition();
                if (pos) {
                  const logicalX = snap((pos.x - stagePos.x) / stageScale);
                  const logicalY = snap((pos.y - stagePos.y) / stageScale);
                  updateWall({ wallId: wall.id, floor_id: floorId, x2: logicalX, y2: logicalY });
                  createWall({
                    floor_id: floorId,
                    x1: logicalX,
                    y1: logicalY,
                    x2: wall.x2,
                    y2: wall.y2,
                    isDoor: wall.isDoor
                  });
                }
              }
            }}
            draggable={isWallMode}
          />
          {isWallMode && (
            <>
              <Circle
                id={`wall-circle-start-${wall.id}`}
                x={wall.x1}
                y={wall.y1}
                radius={6}
                fill="#3b82f6"
                draggable
                dragBoundFunc={dragBoundFunc}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const pos = { x: e.target.x(), y: e.target.y() };
                  e.target.getStage()?.findOne(`#wall-line-${wall.id}`)?.setAttr('points', [pos.x, pos.y, wall.x2, wall.y2]);
                  floor.walls?.forEach((w: any) => {
                    if (w.id !== wall.id) {
                      if (Math.abs(w.x1 - wall.x1) < 15 && Math.abs(w.y1 - wall.y1) < 15) {
                        e.target.getStage()?.findOne(`#wall-line-${w.id}`)?.setAttr('points', [pos.x, pos.y, w.x2, w.y2]);
                        e.target.getStage()?.findOne(`#wall-circle-start-${w.id}`)?.position(pos);
                      }
                      if (Math.abs(w.x2 - wall.x1) < 15 && Math.abs(w.y2 - wall.y1) < 15) {
                        e.target.getStage()?.findOne(`#wall-line-${w.id}`)?.setAttr('points', [w.x1, w.y1, pos.x, pos.y]);
                        e.target.getStage()?.findOne(`#wall-circle-end-${w.id}`)?.position(pos);
                      }
                    }
                  });
                }}
                onDragEnd={(e) => {
                  e.cancelBubble = true;
                  const pos = { x: e.target.x(), y: e.target.y() };
                  updateWall({ wallId: wall.id, floor_id: floorId, x1: pos.x, y1: pos.y });
                  floor.walls?.forEach((w: any) => {
                    if (w.id !== wall.id) {
                      if (Math.abs(w.x1 - wall.x1) < 15 && Math.abs(w.y1 - wall.y1) < 15) {
                        updateWall({ wallId: w.id, floor_id: floorId, x1: pos.x, y1: pos.y });
                      }
                      if (Math.abs(w.x2 - wall.x1) < 15 && Math.abs(w.y2 - wall.y1) < 15) {
                        updateWall({ wallId: w.id, floor_id: floorId, x2: pos.x, y2: pos.y });
                      }
                    }
                  });
                }}
              />
              <Circle
                id={`wall-circle-end-${wall.id}`}
                x={wall.x2}
                y={wall.y2}
                radius={6}
                fill="#3b82f6"
                draggable
                dragBoundFunc={dragBoundFunc}
                onDragMove={(e) => {
                  e.cancelBubble = true;
                  const pos = { x: e.target.x(), y: e.target.y() };
                  e.target.getStage()?.findOne(`#wall-line-${wall.id}`)?.setAttr('points', [wall.x1, wall.y1, pos.x, pos.y]);
                  floor.walls?.forEach((w: any) => {
                    if (w.id !== wall.id) {
                      if (Math.abs(w.x1 - wall.x2) < 15 && Math.abs(w.y1 - wall.y2) < 15) {
                        e.target.getStage()?.findOne(`#wall-line-${w.id}`)?.setAttr('points', [pos.x, pos.y, w.x2, w.y2]);
                        e.target.getStage()?.findOne(`#wall-circle-start-${w.id}`)?.position(pos);
                      }
                      if (Math.abs(w.x2 - wall.x2) < 15 && Math.abs(w.y2 - wall.y2) < 15) {
                        e.target.getStage()?.findOne(`#wall-line-${w.id}`)?.setAttr('points', [w.x1, w.y1, pos.x, pos.y]);
                        e.target.getStage()?.findOne(`#wall-circle-end-${w.id}`)?.position(pos);
                      }
                    }
                  });
                }}
                onDragEnd={(e) => {
                  e.cancelBubble = true;
                  const pos = { x: e.target.x(), y: e.target.y() };
                  updateWall({ wallId: wall.id, floor_id: floorId, x2: pos.x, y2: pos.y });
                  floor.walls?.forEach((w: any) => {
                    if (w.id !== wall.id) {
                      if (Math.abs(w.x1 - wall.x2) < 15 && Math.abs(w.y1 - wall.y2) < 15) {
                        updateWall({ wallId: w.id, floor_id: floorId, x1: pos.x, y1: pos.y });
                      }
                      if (Math.abs(w.x2 - wall.x2) < 15 && Math.abs(w.y2 - wall.y2) < 15) {
                        updateWall({ wallId: w.id, floor_id: floorId, x2: pos.x, y2: pos.y });
                      }
                    }
                  });
                }}
              />
            </>
          )}
        </Group>
      ))}

      {newWallPoints && (
        <Line
          points={newWallPoints}
          stroke="#9ca3af"
          strokeWidth={8}
          lineCap="round"
          dash={[10, 10]}
          listening={false}
        />
      )}
    </>
  );
};
