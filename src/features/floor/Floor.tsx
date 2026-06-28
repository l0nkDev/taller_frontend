import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import {
  XStack,
  YStack,
  Card,
  H2,
  Text,
  ScrollView,
  View,
  SizableText,
  Tabs,
  Button,
  Spinner,
  Input,
} from 'tamagui';
import {
  CookingPot,
  BrainCircuit,
  ShoppingCart,
  Plus,
  Trash,
  Minus,
  Check,
  Mic,
  Combine,
  Split,
  PlusSquare,
  Pencil,
  Lock,
  DollarSign,
  Send,
  Blocks,
  RefreshCcw,
  Sparkles,
  X as XIcon,
} from '@tamagui/lucide-icons';
import {
  useGetFloorPlanQuery,
  useGetFloorsQuery,
  useUpdateGroupMutation,
  useUpdateTableMutation,
  useCreateTableMutation,
  useDisbandGroupMutation,
  useCreateGroupMutation,
  useCreateWallMutation,
  useUpdateWallMutation,
  useDeleteWallMutation,
  useDeleteTableMutation,
} from '../../api/floorApi';
import {
  useGetActiveOrdersQuery,
  useSyncBulkOrderMutation,
  useUpdateOrderDetailMutation,
  usePayOrderMutation,
} from '../../api/orderApi';
import { FloorDialog, PlaceholderFloorDialog } from './components/FloorDialog';
import { Dish, useGetDishesQuery } from '../../api/dishesApi';
import { useAIAssistant } from './hooks/useAIAssistant';
import { useLayoutOptimizer } from './hooks/useLayoutOptimizer';
import { useFloorInteraction } from './hooks/useFloorInteraction';
import { useAppSelector } from '../../store/hooks';
import { TableNode } from './components/TableNode';
import { WallLayer } from './components/WallLayer';
import { HeatmapLayer } from './components/HeatmapLayer';

const statusMap: Record<string, { name: string; color: string }> = {
  T: { name: 'TOMADO', color: '$cyan500' },
  K: { name: 'ESPERANDO', color: '$blue500' },
  C: { name: 'COCINANDO', color: '$amber500' },
  R: { name: 'LISTO', color: '$green500' },
  S: { name: 'ENTREGADO', color: '$green700' },
  X: { name: 'CANCELADO', color: '$gray600' },
};

function PlaceholderMap() {
  return (
    <YStack f={1} gap="$3">
      <XStack f={1} gap="$5">
        <YStack f={1} gap="$3">
          <XStack
            gap="$3"
            p="$2"
            bg="$cardBg"
            bw={2}
            boc="$cardBorder"
            br="$4"
            ai="center"
            jc="space-between"
          >
            <Button size="$3" />
          </XStack>
          <Card bw={2} boc="$cardBorder" bg="$cardBg" br="$6" f={1} ai="center" jc="center">
            <Spinner size="large" color="$amber700" scale={2} />
          </Card>
        </YStack>
      </XStack>
    </YStack>
  );
}

function ErrorScreen({ refresh }: { refresh: () => void }) {
  return (
    <View f={1} ai="center" jc="center">
      <YStack ai="center" gap={16}>
        <View ai="center" jc="center" w={128} h={128} bc="$amber700" br={64}>
          <Blocks col="$white" size={64} />
        </View>
        <Text fos={24} fow={900}>
          Error al cargar el plano.
        </Text>
        <Button icon={<RefreshCcw />} onPress={() => refresh()}>
          Recargar
        </Button>
      </YStack>
    </View>
  );
}

export function FloorView() {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);

  // Fetch floors
  const { data: floors, isFetching, isError, refetch } = useGetFloorsQuery();

  useEffect(() => {
    if (floors && floors.length > 0 && selectedFloor === null) {
      setSelectedFloor(floors[0].id);
    }
  }, [floors, selectedFloor]);

  return (
    <YStack p="$5" fg={1} fb={0} overflow="hidden">
      <YStack mb="$6">
        <H2 fos="$9" color="$primaryText" fontWeight={500}>
          Plano de piso
        </H2>
        <Text fos="$5" color="$secondaryText" mt="$2">
          Gestiona las mesas y su disposición en el restaurante
        </Text>
      </YStack>

      {/* --- ZONA DE BOTONES (REALES VS SKELETONS) --- */}
      {!isError ? (
        <>
          <YStack mb="$5">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ minWidth: '100%' }}
            >
              <XStack gap="$2">
                {isFetching ? (
                  // Mostramos placeholders si los pisos aún no cargan
                  <>
                    <PlaceholderFloorDialog />
                    <PlaceholderFloorDialog />
                    <PlaceholderFloorDialog />
                    <Button
                      br="$5"
                      ai="center"
                      jc="space-between"
                      backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                      color="white"
                      icon={<Plus />}
                    />
                  </>
                ) : (
                  // Mostramos los botones reales cuando ya hay datos
                  <>
                    {floors &&
                      floors.map((floor) => (
                        <FloorDialog
                          key={`fd-${floor.id}`}
                          floor={floor}
                          selectedId={selectedFloor}
                          setSelectedId={setSelectedFloor}
                        />
                      ))}
                    <FloorDialog floor={null} selectedId={null} setSelectedId={null} />
                  </>
                )}
              </XStack>
            </ScrollView>
          </YStack>

          {/* --- ZONA DEL MAPA (REAL VS SKELETON) --- */}
          <YStack fg={1} fb={0} minHeight={0}>
            {selectedFloor ? (
              <InteractiveFloorMap floorId={selectedFloor} key={selectedFloor} />
            ) : (
              <PlaceholderMap />
            )}
          </YStack>
        </>
      ) : (
        <ErrorScreen refresh={refetch} />
      )}
    </YStack>
  );
}
function InteractiveFloorMap({ floorId }: { floorId: number }) {
  const { role } = useAppSelector((state) => state.auth.user || { role: '' });
  const {
    data: floor,
    isLoading,
    isError,
    refetch,
  } = useGetFloorPlanQuery(floorId, { skip: !floorId });

  const {
    optState,
    setOptState,
    previewPositions,
    setPreviewPositions,
    showHeatmap,
    heatmapData,
    runOptimization,
    applyOptimization,
  } = useLayoutOptimizer(floor, floorId);

  const {
    dimensions,
    setDimensions,
    stageScale,
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
  } = useFloorInteraction(floor, optState);

  const [dishesMap, setDishesMap] = useState<Record<number, { dish: Dish; quantity: number }>>({});
  const { data: dishes } = useGetDishesQuery();

  const {
    isRecording,
    aiText,
    setAiText,
    isParsingAI,
    startRecording,
    stopRecording,
    handleSendAIText,
  } = useAIAssistant(dishes || [], setDishesMap);

  const [updateTable] = useUpdateTableMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [createTable] = useCreateTableMutation();
  const [deleteTable] = useDeleteTableMutation();
  const [disbandGroup] = useDisbandGroupMutation();
  const [createGroup] = useCreateGroupMutation();

  const { data: activeOrders } = useGetActiveOrdersQuery(undefined);
  const [syncBulkOrder, { isLoading: isSyncing }] = useSyncBulkOrderMutation();
  const [updateOrderDetail, { isLoading: isUpdatingDetail }] = useUpdateOrderDetailMutation();
  const [payOrder, { isLoading: isPaying }] = usePayOrderMutation();

  const [inputMode, setInputMode] = useState<string>('manual');
  const [createWall] = useCreateWallMutation();
  const [updateWall] = useUpdateWallMutation();
  const [deleteWall] = useDeleteWallMutation();

  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSelection = selectedIds.length === 1 ? selectedIds[0] : null;

    if (currentSelection !== lastSelectedRef.current) {
      lastSelectedRef.current = currentSelection;
      const newMap: { [key: number]: { dish: Dish; quantity: number } } = {};

      if (currentSelection && dishes && activeOrders && floor) {
        let targetGroupId = null;
        if (currentSelection.startsWith('group-')) {
          targetGroupId = parseInt(currentSelection.replace('group-', ''), 10);
        } else if (currentSelection.startsWith('table-')) {
          const tId = parseInt(currentSelection.replace('table-', ''), 10);
          const parentGroup = floor.table_groups.find((g) =>
            g.current_tables.some((t) => t.id === tId),
          );
          targetGroupId = parentGroup?.id;
        }

        if (targetGroupId) {
          const order = activeOrders.find((o) => o.tablegroup_id === targetGroupId);
          if (order) {
            order.detail.forEach((det) => {
              // FIX: Solo cargamos al carrito local los platillos en estado T (Borrador)
              if (det.status === 'T') {
                const d = dishes.find((dish) => dish.id === det.dish_id);
                if (d) {
                  if (newMap[d.id]) newMap[d.id].quantity += det.quantity;
                  else newMap[d.id] = { dish: d, quantity: det.quantity };
                }
              }
            });
          }
        }
      }

      setTimeout(() => {
        setDishesMap(newMap);
      }, 0);
    }
  }, [selectedIds, activeOrders, dishes, floor]);

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const nodes = selectedIds
        .map((id) => stageRef.current?.findOne(`#${id}`))
        .filter((node) => node !== undefined) as Konva.Node[];
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds, stageScale, stagePos, floor, isEditMode]);

  useEffect(() => {
    if (!containerNode) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerNode);
    return () => resizeObserver.disconnect();
  }, [containerNode, setDimensions]);

  const handleAddTable = () => {
    const centerX = (dimensions.width / 2 - stagePos.x) / stageScale;
    const centerY = (dimensions.height / 2 - stagePos.y) / stageScale;
    createTable({
      floor_id: floorId,
      offset_x: centerX,
      offset_y: centerY,
      rotation: 0,
      width: 100,
      height: 100,
      capacity: 4,
    });
  };

  const handleGroup = async () => {
    let tableIds: number[] = [];
    selectedIds.forEach((id) => {
      if (id.startsWith('table-')) tableIds.push(parseInt(id.replace('table-', ''), 10));
      else if (id.startsWith('group-')) {
        const groupId = parseInt(id.replace('group-', ''), 10);
        const group = floor?.table_groups.find((g) => g.id === groupId);
        if (group) group.current_tables.forEach((t) => tableIds.push(t.id));
      }
    });
    tableIds = Array.from(new Set(tableIds));
    if (tableIds.length < 2) return;
    const firstTableNode = stageRef.current?.findOne(`#table-${tableIds[0]}`);
    if (!firstTableNode) return;
    const absPos = firstTableNode.getAbsolutePosition();
    const absRot = firstTableNode.getAbsoluteRotation();
    const logicalX = (absPos.x - stageRef.current!.x()) / stageRef.current!.scaleX();
    const logicalY = (absPos.y - stageRef.current!.y()) / stageRef.current!.scaleY();
    await createGroup({
      floor_id: floorId,
      table_ids: tableIds,
      pos_x: logicalX,
      pos_y: logicalY,
      rotation: absRot,
      capacity: 4,
    }).unwrap();
    setSelectedIds([]);
  };

  const handleUngroupOrDelete = async () => {
    if (selectedIds.length === 1 && selectedIds[0].startsWith('group-')) {
      const groupId = parseInt(selectedIds[0].replace('group-', ''), 10);
      const targetGroup = floor?.table_groups.find((g) => g.id === groupId);
      if (targetGroup) {
        if (targetGroup.current_tables.length > 1) {
          await disbandGroup(groupId).unwrap();
          setSelectedIds([]);
        } else {
          const tId = targetGroup.current_tables[0].id;
          await deleteTable(tId).unwrap();
          setSelectedIds([]);
        }
      }
      return;
    }
    if (selectedIds.length === 1 && selectedIds[0].startsWith('table-')) {
      const tableId = parseInt(selectedIds[0].replace('table-', ''), 10);
      const targetGroup = floor?.table_groups.find((g) =>
        g.current_tables.some((t) => t.id === tableId),
      );
      const targetTable = targetGroup?.current_tables.find((t) => t.id === tableId);
      if (!targetGroup || !targetTable) return;
      const tableNode = stageRef.current?.findOne(`#table-${tableId}`);
      if (!tableNode) return;
      const absPos = tableNode.getAbsolutePosition();
      const absRot = tableNode.getAbsoluteRotation();
      const logicalX = (absPos.x - stageRef.current!.x()) / stageRef.current!.scaleX();
      const logicalY = (absPos.y - stageRef.current!.y()) / stageRef.current!.scaleY();
      updateTable({
        tableId,
        floor_id: floorId,
        current_group_id: targetTable.base_group_id,
        offset_x: logicalX,
        offset_y: logicalY,
        rotation: absRot,
      });
      setSelectedIds([`group-${targetTable.base_group_id}`]);
    }
  };

  const isMultipleSelected = selectedIds.length > 1;
  const isGroupSelected = selectedIds.length === 1 && selectedIds[0].startsWith('group-');
  const isSubSelectedTable = selectedIds.length === 1 && selectedIds[0].startsWith('table-');

  let isComplexGroup = false;
  let currentTargetGroupId = null;

  if (isGroupSelected) {
    const groupId = parseInt(selectedIds[0].replace('group-', ''), 10);
    currentTargetGroupId = groupId;
    const g = floor?.table_groups.find((gr) => gr.id === groupId);
    if (g && g.current_tables.length > 1) isComplexGroup = true;
  } else if (isSubSelectedTable) {
    const tId = parseInt(selectedIds[0].replace('table-', ''), 10);
    const g = floor?.table_groups.find((gr) => gr.current_tables.some((t) => t.id === tId));
    currentTargetGroupId = g?.id;
  }

  const activeOrder = activeOrders?.find((o) => o.tablegroup_id === currentTargetGroupId);
  const disableScale = isMultipleSelected || isComplexGroup;
  const showTransformer = isEditMode && selectedIds.length > 0 && !isSubSelectedTable;

  let btnUngroupText = 'Eliminar Mesa';
  if (isGroupSelected && isComplexGroup) btnUngroupText = 'Desarmar Grupo';
  if (isSubSelectedTable) btnUngroupText = 'Extraer de Grupo';

  const shouldShowSidebar =
    selectedIds.length === 1 && !isSubSelectedTable && !isEditMode && optState === 'idle';

  let displayLabel = '';
  if (shouldShowSidebar) {
    const idStr = selectedIds[0];
    if (isComplexGroup) displayLabel = `Pedido de Grupo ${idStr.replace('group-', '')}`;
    else if (idStr.startsWith('group-')) {
      const gId = parseInt(idStr.replace('group-', ''), 10);
      const g = floor?.table_groups.find((gr) => gr.id === gId);
      if (g && g.current_tables.length > 0)
        displayLabel = `Pedido de Mesa ${g.current_tables[0].id}`;
    }
  }

  // --- LÓGICA DE COBRO ---
  // Filtramos los T (borrador) y X (cancelados) para saber si ya se puede cobrar.
  const sentDetails = activeOrder?.detail.filter((d) => d.status !== 'T') || [];
  const validSentDetails = sentDetails.filter((d) => d.status !== 'X');
  const allDelivered =
    validSentDetails.length > 0 && validSentDetails.every((d) => d.status === 'S');
  const hasDraftItems = Object.keys(dishesMap).length > 0;
  const canPay = allDelivered && !hasDraftItems;

  if (isLoading) return <PlaceholderMap />;
  if (isError || !floor) return <ErrorScreen refresh={refetch} />;

  return (
    <YStack f={1} gap="$4">
      <XStack f={1} gap="$5">
        <YStack f={1} gap="$3" $sm={shouldShowSidebar ? { display: 'none' } : {}}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            w="100%"
            contentContainerStyle={{ minWidth: '100%' }}
          >
            <XStack
              minWidth="100%"
              gap="$3"
              p="$2"
              bg="$cardBg"
              bw={2}
              boc="$cardBorder"
              br="$4"
              ai="center"
              jc="space-between"
            >
              <XStack gap="$3" ai="center">
                {isWallMode && (
                  <>
                    <Button size="$3" onPress={() => setNewWallPoints(null)}>
                      Cancelar Dibujo
                    </Button>
                    {selectedWallId && (
                      <>
                        <Button
                          size="$3"
                          onPress={() => {
                            const w = floor?.walls.find((x) => x.id === selectedWallId);
                            if (w)
                              updateWall({ wallId: w.id, floor_id: floorId, isDoor: !w.isDoor });
                          }}
                        >
                          Alternar Puerta
                        </Button>
                        <Button
                          size="$3"
                          icon={Trash}
                          onPress={() => {
                            deleteWall(selectedWallId);
                            setSelectedWallId(null);
                          }}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </>
                )}
                {isEditMode && (
                  <>
                    <Button size="$3" icon={PlusSquare} onPress={handleAddTable}>
                      Nueva Mesa
                    </Button>
                    <Button
                      size="$3"
                      icon={Combine}
                      onPress={handleGroup}
                      disabled={selectedIds.length < 2}
                      opacity={selectedIds.length < 2 ? 0.5 : 1}
                    >
                      Agrupar
                    </Button>
                    <Button
                      size="$3"
                      icon={Split}
                      onPress={handleUngroupOrDelete}
                      disabled={selectedIds.length !== 1}
                      opacity={selectedIds.length !== 1 ? 0.5 : 1}
                    >
                      {btnUngroupText}
                    </Button>
                  </>
                )}
              </XStack>
              <XStack gap="$3" ai="center">
                <Button
                  size="$3"
                  icon={isWallMode ? Lock : Pencil}
                  onPress={() => {
                    setIsWallMode(!isWallMode);
                    setIsEditMode(false);
                    setSelectedIds([]);
                    setSelectedWallId(null);
                    setNewWallPoints(null);
                  }}
                >
                  {isWallMode ? 'Terminar Paredes' : 'Editar Paredes'}
                </Button>
                <Button
                  size="$3"
                  icon={isEditMode ? Lock : Pencil}
                  onPress={() => {
                    setIsEditMode(!isEditMode);
                    setIsWallMode(false);
                    setSelectedIds([]);
                    setSelectedWallId(null);
                    setNewWallPoints(null);
                  }}
                >
                  {isEditMode ? 'Bloquear Mesas' : 'Editar Mesas'}
                </Button>
                {optState === 'preview' ? (
                  <>
                    <Button size="$3" onPress={applyOptimization}>
                      Aplicar
                    </Button>
                    <Button
                      size="$3"
                      onPress={() => {
                        setOptState('idle');
                        setPreviewPositions({});
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  role === 'admin' && (
                    <Button
                      size="$3"
                      icon={Sparkles}
                      onPress={runOptimization}
                      disabled={optState === 'optimizing'}
                    >
                      {optState === 'optimizing' ? 'Calculando...' : 'Auto-Distribuir'}
                    </Button>
                  )
                )}
              </XStack>
            </XStack>
          </ScrollView>

          <Card bw={2} boc="$cardBorder" bg="$cardBg" br="$6" f={1}>
            <YStack f={1} overflow="hidden">
              <div
                ref={setContainerNode}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  touchAction: 'none',
                  borderRadius: '$6',
                  backgroundSize: `${snap(10) * stageScale}px ${snap(10) * stageScale}px`,
                  backgroundPosition: `${stagePos.x}px ${stagePos.y}px`,
                  backgroundImage:
                    isEditMode || isWallMode
                      ? `linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)`
                      : undefined,
                  backgroundColor: '#ffffff',
                }}
              >
                {dimensions.width > 0 && dimensions.height > 0 && (
                  <Stage
                    ref={stageRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    draggable={!isWallMode}
                    scaleX={stageScale}
                    scaleY={stageScale}
                    x={stagePos.x}
                    y={stagePos.y}
                    onWheel={handleWheel}
                    onDragEnd={(e) => {
                      if (e.target === e.target.getStage())
                        setStagePos({ x: e.target.x(), y: e.target.y() });
                    }}
                    onMouseDown={(e) => {
                      checkDeselect(e);
                      if (isWallMode) {
                        const pos = e.target.getStage()?.getPointerPosition();
                        if (pos) {
                          const logicalX = snap((pos.x - stagePos.x) / stageScale);
                          const logicalY = snap((pos.y - stagePos.y) / stageScale);
                          if (!newWallPoints) {
                            if (e.target === e.target.getStage()) {
                              setNewWallPoints([logicalX, logicalY, logicalX, logicalY]);
                            }
                          } else {
                            createWall({
                              floor_id: floorId,
                              x1: newWallPoints[0],
                              y1: newWallPoints[1],
                              x2: logicalX,
                              y2: logicalY,
                              isDoor: false,
                            });
                            setNewWallPoints([logicalX, logicalY, logicalX, logicalY]);
                          }
                        }
                      }
                    }}
                    onMouseMove={(e) => {
                      if (isWallMode && newWallPoints) {
                        const pos = e.target.getStage()?.getPointerPosition();
                        if (pos) {
                          const logicalX = snap((pos.x - stagePos.x) / stageScale);
                          const logicalY = snap((pos.y - stagePos.y) / stageScale);
                          setNewWallPoints([
                            newWallPoints[0],
                            newWallPoints[1],
                            logicalX,
                            logicalY,
                          ]);
                        }
                      }
                    }}
                    onTouchStart={checkDeselect}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ cursor: isWallMode ? 'crosshair' : 'grab' }}
                  >
                    <Layer>
                      <WallLayer
                        floor={floor}
                        floorId={floorId}
                        isWallMode={isWallMode}
                        setSelectedWallId={setSelectedWallId}
                        newWallPoints={newWallPoints}
                        snap={snap}
                        dragBoundFunc={dragBoundFunc}
                        stageScale={stageScale}
                        stagePos={stagePos}
                      />

                      <HeatmapLayer
                        showHeatmap={showHeatmap}
                        optState={optState}
                        heatmapData={heatmapData}
                      />

                      {floor.table_groups?.map((group) => {
                        const groupId = `group-${group.id}`;
                        const groupHasActiveOrder = activeOrders?.some(
                          (o) => o.tablegroup_id === group.id,
                        );
                        const displayX = previewPositions[group.id]?.x ?? group.pos_x;
                        const displayY = previewPositions[group.id]?.y ?? group.pos_y;
                        const displayRot = previewPositions[group.id]?.rotation ?? group.rotation;
                        return (
                          <Group
                            key={groupId}
                            id={groupId}
                            x={displayX}
                            y={displayY}
                            rotation={displayRot}
                            draggable={isEditMode}
                            dragBoundFunc={dragBoundFunc}
                            onClick={(e) => {
                              e.cancelBubble = true;
                              handleNodeSelect(e.currentTarget, e.evt.shiftKey);
                            }}
                            onTap={(e) => {
                              e.cancelBubble = true;
                              handleNodeSelect(e.currentTarget, false);
                            }}
                            onDragEnd={(e) => {
                              if (e.target !== e.currentTarget) return;
                              e.cancelBubble = true;
                              updateGroup({
                                groupId: group.id,
                                floor_id: floorId,
                                pos_x: e.target.x(),
                                pos_y: e.target.y(),
                              });
                            }}
                            onTransformEnd={(e) => {
                              if (e.target !== e.currentTarget) return;
                              const node = e.target;
                              const scaleX = node.scaleX();
                              const scaleY = node.scaleY();
                              node.scaleX(1);
                              node.scaleY(1);

                              if (group.current_tables.length === 1) {
                                const innerTable = group.current_tables[0];
                                const newWidth = snap(
                                  Math.max(20, Math.abs((innerTable.width || 60) * scaleX)),
                                );
                                const newHeight = snap(
                                  Math.max(20, Math.abs((innerTable.height || 60) * scaleY)),
                                );
                                const newOffsetX = (innerTable.offset_x || 0) * scaleX;
                                const newOffsetY = (innerTable.offset_y || 0) * scaleY;

                                const groupNode = e.target
                                  .getStage()
                                  ?.findOne(`#table-${innerTable.id}`) as Konva.Group;
                                if (groupNode && typeof groupNode.findOne === 'function') {
                                  groupNode.setAttr('width', newWidth);
                                  groupNode.setAttr('height', newHeight);
                                  groupNode.setAttr('x', newOffsetX);
                                  groupNode.setAttr('y', newOffsetY);

                                  const rect = groupNode.findOne('Rect');
                                  if (rect) {
                                    rect.setAttr('width', newWidth);
                                    rect.setAttr('height', newHeight);
                                  }
                                  const text = groupNode.findOne('Text');
                                  if (text) {
                                    text.setAttr('width', newWidth);
                                    text.setAttr('height', newHeight);
                                  }
                                }

                                updateTable({
                                  tableId: innerTable.id,
                                  floor_id: floorId,
                                  width: newWidth,
                                  height: newHeight,
                                  offset_x: node.x(),
                                  offset_y: node.y(),
                                  rotation: node.rotation(),
                                });
                              } else {
                                updateGroup({
                                  groupId: group.id,
                                  floor_id: floorId,
                                  pos_x: node.x(),
                                  pos_y: node.y(),
                                  rotation: node.rotation(),
                                });
                              }
                            }}
                          >
                            {group.current_tables?.map((table) => (
                              <TableNode
                                key={`table-${table.id}`}
                                table={table}
                                isSelected={
                                  selectedIds.includes(`table-${table.id}`) ||
                                  selectedIds.includes(groupId)
                                }
                                onSelect={handleNodeSelect}
                                hasActiveOrder={!!groupHasActiveOrder}
                              />
                            ))}
                          </Group>
                        );
                      })}
                      {showTransformer && (
                        <Transformer
                          ref={transformerRef}
                          flipEnabled={false}
                          enabledAnchors={
                            disableScale
                              ? []
                              : [
                                  'top-left',
                                  'top-center',
                                  'top-right',
                                  'middle-right',
                                  'bottom-right',
                                  'bottom-center',
                                  'bottom-left',
                                  'middle-left',
                                ]
                          }
                          resizeEnabled={!disableScale}
                          boundBoxFunc={(oldBox, newBox) => {
                            if (newBox.width < 20 || newBox.height < 20) return oldBox;
                            return newBox;
                          }}
                        />
                      )}
                    </Layer>
                  </Stage>
                )}
              </div>
            </YStack>
          </Card>
        </YStack>

        {shouldShowSidebar && (
          <YStack
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            overflow="hidden"
            w={350}
            $sm={{ w: '100%', flex: 1, bw: 0, br: 0 }}
          >
            <XStack
              w="100%"
              backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
              p="$3"
              gap="$3"
              ai="center"
              jc="space-between"
            >
              <XStack ai="center" gap="$3">
                <ShoppingCart col="$white" size={20} />
                <Text col="$white" fow="500">
                  {displayLabel}
                </Text>
              </XStack>
              <Button
                size="$3"
                circular
                bg="transparent"
                icon={<XIcon col="$white" size={20} />}
                onPress={() => setSelectedIds([])}
                display="none"
                $sm={{ display: 'flex' }}
              />
            </XStack>

            <Tabs
              defaultValue="manual"
              f={1}
              value={inputMode}
              onValueChange={setInputMode}
              flexDirection="column"
            >
              <Tabs.List p="$3" w="100%" bbw={2} bbc="$cardBorder" bg="$cardBg" gap="$2" br={0}>
                <Tabs.Tab
                  br="$3"
                  f={1}
                  value="manual"
                  bc={inputMode === 'manual' ? 'transparent' : '$amber100'}
                  backgroundImage={
                    inputMode === 'manual'
                      ? 'linear-gradient(to right, var(--brandMain), var(--orange500))'
                      : undefined
                  }
                >
                  <CookingPot
                    col={inputMode === 'manual' ? '$white' : undefined}
                    size={16}
                    mr="$2"
                  />
                  <SizableText col={inputMode === 'manual' ? '$white' : undefined}>
                    Manual
                  </SizableText>
                </Tabs.Tab>
                <Tabs.Tab
                  br="$3"
                  f={1}
                  value="ai"
                  bc={inputMode === 'ai' ? 'transparent' : '$amber100'}
                  backgroundImage={
                    inputMode === 'ai'
                      ? 'linear-gradient(to right, var(--brandMain), var(--orange500))'
                      : undefined
                  }
                >
                  <BrainCircuit col={inputMode === 'ai' ? '$white' : undefined} size={16} mr="$2" />
                  <SizableText col={inputMode === 'ai' ? '$white' : undefined}>IA</SizableText>
                </Tabs.Tab>
              </Tabs.List>

              <ScrollView f={1} showsVerticalScrollIndicator={false} bbw={2} boc="$cardBorder">
                {(validSentDetails.length > 0 || Object.keys(dishesMap).length > 0) && (
                  <YStack px="$3" gap="$3" py="$3">
                    {/* Título unificado */}
                    {(validSentDetails.length > 0 || Object.keys(dishesMap).length > 0) && (
                      <Text fow="bold" col="$blue900" mb="$2">
                        🛒 Pedido de la Mesa
                      </Text>
                    )}

                    {/* 1. ÍTEMS BLOQUEADOS (Ya en cocina o entregados) */}
                    {validSentDetails.map((detail) => {
                      const dInfo = dishes?.find((d) => d.id === detail.dish_id);
                      const isReady = detail.status === 'R';

                      return (
                        <YStack
                          key={`sent-${detail.id}`}
                          p="$3"
                          gap="$2"
                          backgroundColor="$gray2"
                          br="$3"
                          boc="$cardBorder"
                          bw={2}
                        >
                          <XStack jc="space-between">
                            <Text color="$gray11">{detail.dish_name}</Text>
                            <Text color="$gray11">Bs. {dInfo ? dInfo.price : '0.00'}</Text>
                          </XStack>

                          <XStack ai="center" f={1} jc="space-between" gap="$2">
                            {/* Sin botones: Solo texto estático indicando la cantidad bloqueada */}
                            <Text fontWeight="bold" fos={14} col="$gray11">
                              Cantidad: {detail.quantity}
                            </Text>
                          </XStack>

                          <XStack f={1} jc="space-between" ai="center" mt="$2">
                            <Text
                              px={8}
                              py={4}
                              bc={statusMap[detail.status].color}
                              col="white"
                              fos={12}
                              fow={900}
                              br={5}
                            >
                              {statusMap[detail.status].name}
                            </Text>

                            {/* Botón para marcar entregado si la cocina avisa que está listo */}
                            {isReady && (
                              <Button
                                size="$2"
                                bg={statusMap.R.color}
                                disabled={isUpdatingDetail}
                                onPress={() =>
                                  updateOrderDetail({
                                    detail_id: detail.id,
                                    status: 'S',
                                  })
                                }
                              >
                                <Text col="$white" fow="bold" fos={12}>
                                  ENTREGAR
                                </Text>
                              </Button>
                            )}
                          </XStack>
                        </YStack>
                      );
                    })}

                    {/* 2. ÍTEMS EDITABLES (Borradores guardados y platos nuevos) */}
                    {Object.values(dishesMap).map((e, i) => {
                      const isDraftInDb = activeOrder?.detail.find(
                        (d) => d.dish_id === e.dish.id && d.status === 'T',
                      );

                      return (
                        <YStack
                          p="$3"
                          key={`draft-${i}`}
                          gap="$2"
                          backgroundColor="$amber50"
                          br="$3"
                          boc="$brandMain"
                          bw={2}
                        >
                          <XStack jc="space-between">
                            <Text>{e.dish.name}</Text>
                            <Text>Bs. {e.dish.price}</Text>
                          </XStack>

                          <XStack ai="center" f={1} jc="space-between" gap="$2">
                            <XStack ai="center" f={1} jc="space-between">
                              <View
                                w={30}
                                h={30}
                                br="$3"
                                bg="$amber200"
                                ai="center"
                                jc="center"
                                hoverStyle={{ backgroundColor: '$amber500' }}
                                onPress={() =>
                                  setDishesMap((prev) => {
                                    const existing = prev[e.dish.id];
                                    if (existing) {
                                      const newQty = existing.quantity - 1;
                                      if (newQty <= 0) {
                                        const newMap = { ...prev };
                                        delete newMap[e.dish.id];
                                        return newMap;
                                      }
                                      return {
                                        ...prev,
                                        [e.dish.id]: {
                                          ...existing,
                                          quantity: newQty,
                                        },
                                      };
                                    }
                                    return prev;
                                  })
                                }
                              >
                                <Minus size={12} />
                              </View>
                              <Text fontWeight="bold">{e.quantity}</Text>
                              <View
                                w={30}
                                h={30}
                                br="$3"
                                bg="$amber200"
                                ai="center"
                                jc="center"
                                hoverStyle={{ backgroundColor: '$amber500' }}
                                onPress={() =>
                                  setDishesMap((prev) => {
                                    const existing = prev[e.dish.id];
                                    return {
                                      ...prev,
                                      [e.dish.id]: {
                                        dish: e.dish,
                                        quantity: existing ? existing.quantity + 1 : 1,
                                      },
                                    };
                                  })
                                }
                              >
                                <Plus size={12} />
                              </View>
                            </XStack>
                            <View
                              w={30}
                              h={30}
                              br="$3"
                              bg="$red500"
                              ai="center"
                              jc="center"
                              hoverStyle={{ backgroundColor: '$red700' }}
                              onPress={() =>
                                setDishesMap((prev) => {
                                  const newMap = { ...prev };
                                  delete newMap[e.dish.id];
                                  return newMap;
                                })
                              }
                            >
                              <Trash size={12} col="$white" />
                            </View>
                          </XStack>

                          <XStack f={1} jc="center" mt="$2">
                            <Text
                              px={8}
                              py={4}
                              bc={isDraftInDb ? statusMap.T.color : '$gray5'}
                              col={isDraftInDb ? 'white' : '$gray9'}
                              fos={12}
                              fow={900}
                              br={5}
                            >
                              {isDraftInDb ? statusMap.T.name : 'NUEVO (SIN GUARDAR)'}
                            </Text>
                          </XStack>
                        </YStack>
                      );
                    })}

                    {/* TOTAL COMBINADO DE LA MESA */}
                    {(validSentDetails.length > 0 || Object.keys(dishesMap).length > 0) && (
                      <XStack jc="space-between" btw={2} boc="$cardBorder" pt="$3" mt="$2">
                        <Text fow="bold" fos={16}>
                          Total Mesa:
                        </Text>
                        <Text fow="bold" fos={16} col="$brandMain">
                          Bs.{' '}
                          {(
                            validSentDetails.reduce((tot, item) => {
                              const d = dishes?.find((d) => d.id === item.dish_id);
                              return tot + (d ? d.price * item.quantity : 0);
                            }, 0) +
                            Object.values(dishesMap).reduce(
                              (tot, item) => tot + item.dish.price * item.quantity,
                              0,
                            )
                          ).toFixed(2)}
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                )}

                <Tabs.Content value="manual" f={1}>
                  <YStack p="$3" gap="$3">
                    <XStack>
                      <Plus size={20} mr="$2" col="$amber700" />
                      <Text>Agregar Items</Text>
                    </XStack>
                    {dishes &&
                      dishes.map((d) =>
                        d.available ? (
                          <Button
                            key={d.id}
                            gap="$2"
                            ai="center"
                            jc="space-between"
                            boc="$cardBorder"
                            bw={2}
                            p="$3"
                            br="$3"
                            hoverStyle={{ backgroundColor: '$amber100' }}
                            onPress={() =>
                              setDishesMap((prev) => {
                                const existing = prev[d.id];
                                return {
                                  ...prev,
                                  [d.id]: {
                                    dish: d,
                                    quantity: existing ? existing.quantity + 1 : 1,
                                  },
                                };
                              })
                            }
                          >
                            <Text>{d.name}</Text>
                            <Text col="$amber700"> Bs. {d.price}</Text>
                          </Button>
                        ) : null,
                      )}
                  </YStack>
                </Tabs.Content>

                <Tabs.Content value="ai" f={1}>
                  <YStack p="$3" gap="$3">
                    <Button
                      backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                      hoverStyle={{ scale: 1.02 }}
                      onPress={isRecording ? stopRecording : startRecording}
                      opacity={isParsingAI ? 0.5 : 1}
                      disabled={isParsingAI}
                      animation="bouncy"
                      animateOnly={['transform']}
                      scale={isRecording ? 1.05 : 1}
                    >
                      {isParsingAI ? (
                        <Spinner color="white" />
                      ) : (
                        <Mic col={isRecording ? '$red500' : 'white'} />
                      )}
                      <Text col="white" fontWeight="600" fontFamily="$body">
                        {isParsingAI
                          ? 'Procesando...'
                          : isRecording
                            ? 'Detener y Enviar'
                            : 'Iniciar pedido por voz'}
                      </Text>
                    </Button>
                    <View position="relative">
                      <Input
                        placeholder="Ej: Quisiera dos hamburguesas..."
                        fos="$5"
                        numberOfLines={4}
                        f={1}
                        bw={2}
                        bc="$cardBorder"
                        bg="$cardBg"
                        outlineStyle="none"
                        outlineColor="transparent"
                        focusStyle={{ boc: '$brandMain' }}
                        value={aiText}
                        onChangeText={setAiText}
                        disabled={isParsingAI}
                        onSubmitEditing={handleSendAIText}
                      />
                      <View
                        position="absolute"
                        b="$2"
                        r="$2"
                        w={30}
                        h={30}
                        br="$3"
                        backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                        ai="center"
                        jc="center"
                        onPress={handleSendAIText}
                        hoverStyle={{ scale: 1.1 }}
                        cursor="pointer"
                      >
                        <Send size={12} col="$white" />
                      </View>
                    </View>
                  </YStack>
                </Tabs.Content>
              </ScrollView>

              {/* LÓGICA CONDICIONAL DE BOTONES: PAGO VS ACTUALIZACIÓN */}
              {canPay && activeOrder ? (
                <Button
                  m="$3"
                  bg="$green500"
                  hoverStyle={{ bg: '$green600' }}
                  disabled={isPaying}
                  onPress={async () => {
                    await payOrder({
                      order_id: activeOrder.id,
                      method: 'C',
                    }).unwrap();
                    setSelectedIds([]);
                  }}
                >
                  {isPaying ? <Spinner color="white" /> : <DollarSign col="white" />}
                  <Text col="white" fontWeight="bold" fontFamily="$body">
                    Cobrar y Liberar Mesa
                  </Text>
                </Button>
              ) : (
                <Button
                  m="$3"
                  backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                  hoverStyle={{ scale: 1.02 }}
                  disabled={Object.keys(dishesMap).length === 0 || isSyncing}
                  opacity={Object.keys(dishesMap).length === 0 || isSyncing ? 0.5 : 1}
                  onPress={async () => {
                    if (currentTargetGroupId) {
                      const itemsToSync = Object.values(dishesMap).map((item) => ({
                        dish_id: item.dish.id,
                        quantity: item.quantity,
                        discount: 0,
                        status: 'T',
                      }));
                      await syncBulkOrder({
                        tablegroup_id: currentTargetGroupId,
                        items: itemsToSync,
                      }).unwrap();
                    }
                  }}
                >
                  {isSyncing ? <Spinner color="white" /> : <Check col="white" />}
                  <Text col="white" fontWeight="600" fontFamily="$body">
                    {activeOrder ? 'Actualizar pedido' : 'Confirmar pedido'}
                  </Text>
                </Button>
              )}
            </Tabs>
          </YStack>
        )}
      </XStack>
    </YStack>
  );
}
