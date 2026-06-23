import { useState, useRef } from 'react';
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

  const baseCenter = useRef<{ x: number; y: number } | null>(null);
  const baseDist = useRef<number>(0);
  const baseScale = useRef<number>(1);
  const basePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const gridSize = 20;
  const snap = (v: number) => Math.round(v / gridSize) * gridSize;
  const dragBoundFunc = (pos: { x: number; y: number }) => {
    const logicalX = (pos.x - stagePos.x) / stageScale;
    const logicalY = (pos.y - stagePos.y) / stageScale;
    return {
      x: snap(logicalX) * stageScale + stagePos.x,
      y: snap(logicalY) * stageScale + stagePos.y,
    };
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    if (e.evt.ctrlKey) {
      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const newScale = Math.max(0.1, Math.min(oldScale * Math.pow(0.999, e.evt.deltaY), 10));
      
      setStageScale(newScale);
      setStagePos({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    } else {
      setStagePos((prev) => ({
        x: prev.x - e.evt.deltaX,
        y: prev.y - e.evt.deltaY,
      }));
    }
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault();
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      const stage = e.target.getStage();
      if (!stage) return;

      if (stage.isDragging()) {
        stage.stopDrag();
      }

      const rect = stage.container().getBoundingClientRect();
      const p1 = { x: touch1.clientX - rect.left, y: touch1.clientY - rect.top };
      const p2 = { x: touch2.clientX - rect.left, y: touch2.clientY - rect.top };

      const getDistance = (pA: { x: number; y: number }, pB: { x: number; y: number }) => {
        return Math.sqrt(Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2));
      };

      const getCenter = (pA: { x: number; y: number }, pB: { x: number; y: number }) => {
        return {
          x: (pA.x + pB.x) / 2,
          y: (pA.y + pB.y) / 2,
        };
      };

      const dist = getDistance(p1, p2);
      const center = getCenter(p1, p2);

      if (!baseCenter.current) {
        baseCenter.current = center;
        baseDist.current = dist;
        baseScale.current = stage.scaleX();
        basePos.current = { x: stage.x(), y: stage.y() };
        return;
      }

      const scaleBy = dist / baseDist.current;
      const newScale = Math.max(0.1, Math.min(baseScale.current * scaleBy, 10));

      const pointTo = {
        x: (baseCenter.current.x - basePos.current.x) / baseScale.current,
        y: (baseCenter.current.y - basePos.current.y) / baseScale.current,
      };

      const newPos = {
        x: baseCenter.current.x - pointTo.x * newScale + (center.x - baseCenter.current.x),
        y: baseCenter.current.y - pointTo.y * newScale + (center.y - baseCenter.current.y),
      };

      setStageScale(newScale);
      setStagePos(newPos);
    }
  };

  const handleTouchEnd = () => {
    baseCenter.current = null;
    baseDist.current = 0;
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      if (isEditMode || isWallMode || optState !== 'idle') {
        setSelectedIds([]);
      }
      setSelectedWallId(null);
    }
  };

  const handleNodeSelect = (node: Konva.Node, isShiftPressed: boolean) => {
    const id = node.id();
    if (id.startsWith('group-')) {
      if (isShiftPressed)
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
      else setSelectedIds([id]);
      return;
    }
    const tableIdMatch = id.match(/table-(\d+)/);
    if (tableIdMatch) {
      const tId = parseInt(tableIdMatch[1], 10);
      const parentGroup = floor?.table_groups.find((g: any) =>
        g.current_tables.some((t: any) => t.id === tId),
      );
      if (parentGroup) {
        const groupId = `group-${parentGroup.id}`;
        if (parentGroup.current_tables.length > 1) {
          if (selectedIds.length === 1 && selectedIds[0] === groupId) setSelectedIds([id]);
          else setSelectedIds([groupId]);
        } else if (isShiftPressed)
          setSelectedIds((prev) =>
            prev.includes(groupId) ? prev.filter((p) => p !== groupId) : [...prev, groupId],
          );
        else setSelectedIds([groupId]);
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
    handleTouchMove,
    handleTouchEnd,
    checkDeselect,
    handleNodeSelect,
    snap,
    dragBoundFunc,
  };
};
