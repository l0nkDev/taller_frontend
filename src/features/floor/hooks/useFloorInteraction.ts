import { useState } from 'react';
import Konva from 'konva';

export const useFloorInteraction = (floor: any, optState: string) => {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWallMode, setIsWallMode] = useState(false);
  const [selectedWallId, setSelectedWallId] = useState<number | null>(null);
  const [newWallPoints, setNewWallPoints] = useState<number[] | null>(null);

  const gridSize = 20;
  const snap = (v: number) => Math.round(v / gridSize) * gridSize;
  const dragBoundFunc = (pos: {x: number, y: number}) => {
    const logicalX = (pos.x - stagePos.x) / stageScale;
    const logicalY = (pos.y - stagePos.y) / stageScale;
    return {
      x: snap(logicalX) * stageScale + stagePos.x,
      y: snap(logicalY) * stageScale + stagePos.y,
    };
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;
    
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const checkDeselect = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>,
  ) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      if (isEditMode || isWallMode || optState !== "idle") {
        setSelectedIds([]);
      }
      setSelectedWallId(null);
    }
  };

  const handleNodeSelect = (node: Konva.Node, isShiftPressed: boolean) => {
    const id = node.id();
    if (id.startsWith("group-")) {
      if (isShiftPressed)
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
      else setSelectedIds([id]);
      return;
    }
    const tableIdMatch = id.match(/table-(\d+)/);
    if (tableIdMatch) {
      const tId = parseInt(tableIdMatch[1]);
      const parentGroup = floor?.table_groups.find((g: any) =>
        g.current_tables.some((t: any) => t.id === tId),
      );
      if (parentGroup) {
        const groupId = `group-${parentGroup.id}`;
        if (parentGroup.current_tables.length > 1) {
          if (selectedIds.length === 1 && selectedIds[0] === groupId)
            setSelectedIds([id]);
          else setSelectedIds([groupId]);
        } else {
          if (isShiftPressed)
            setSelectedIds((prev) =>
              prev.includes(groupId)
                ? prev.filter((p) => p !== groupId)
                : [...prev, groupId],
            );
          else setSelectedIds([groupId]);
        }
      }
    }
  };

  return {
    dimensions,
    setDimensions,
    stageScale,
    setStageScale,
    stagePos,
    setStagePos,
    selectedIds,
    setSelectedIds,
    isEditMode,
    setIsEditMode,
    isWallMode,
    setIsWallMode,
    selectedWallId,
    setSelectedWallId,
    newWallPoints,
    setNewWallPoints,
    handleWheel,
    checkDeselect,
    handleNodeSelect,
    snap,
    dragBoundFunc
  };
};
