import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Group,
  Rect,
  Text as KText,
  Transformer,
} from "react-konva";
import Konva from "konva";
import {
  useGetFloorPlanQuery,
  useGetFloorsQuery,
  useUpdateGroupMutation,
  useUpdateTableMutation,
  useCreateTableMutation,
  useDisbandGroupMutation,
  useCreateGroupMutation,
  TableRead,
} from "../../api/floorApi";
import {
  useGetActiveOrdersQuery,
  useSyncBulkOrderMutation,
} from "../../api/orderApi"; // <-- TUS ENDPOINTS DE ÓRDENES
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
  Input,
} from "tamagui";
import { FloorDialog } from "./components/FloorDialog";
import {
  CookingPot,
  BrainCircuit,
  ShoppingCart,
  Plus,
  Trash,
  Minus,
  Check,
  Mic,
  Send,
  Combine,
  Split,
  PlusSquare,
  Pencil,
  Lock, // <-- ICONOS NUEVOS
} from "@tamagui/lucide-icons";
import { Dish, useGetDishesQuery } from "../../api/dishesApi";
import { Node, NodeConfig } from "konva/lib/Node";

export const FloorView = () => {
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const { data: floors } = useGetFloorsQuery();

  return (
    <YStack p={"$5"} fg={1} fb={0} overflow="hidden">
      <YStack mb="$6">
        <H2 fos="$9" color="$primaryText" fontWeight={500}>
          Plano de piso
        </H2>
        <Text fos="$5" color="$secondaryText" mt="$2">
          Gestiona las mesas y su disposición en el restaurante
        </Text>
      </YStack>

      <YStack mb="$5">
        <ScrollView showsHorizontalScrollIndicator={false}>
          <XStack gap="$2" flexWrap="wrap">
            {floors &&
              floors.map((floor) => (
                <FloorDialog
                  key={`fd-${floor.id}`}
                  floor={floor}
                  selectedId={selectedFloor}
                  setSelectedId={setSelectedFloor}
                />
              ))}
            {floors && (
              <FloorDialog
                floor={null}
                selectedId={null}
                setSelectedId={null}
              />
            )}
          </XStack>
        </ScrollView>
      </YStack>
      <YStack fg={1} fb={0} minHeight={0}>
        {selectedFloor ? (
          <InteractiveFloorMap floorId={selectedFloor} key={selectedFloor} />
        ) : (
          <View f={1} ai="center" jc="center">
            <Text color="$secondaryText">No hay piso seleccionado</Text>
          </View>
        )}
      </YStack>
    </YStack>
  );
};

const TableNode = ({
  table,
  isSelected,
  onSelect,
  hasActiveOrder,
}: {
  table: TableRead;
  isSelected: boolean;
  onSelect: (node: Node<NodeConfig>, isShiftPressed: boolean) => void;
  hasActiveOrder: boolean;
}) => {
  return (
    <Group
      id={`table-${table.id}`}
      x={table.offset_x}
      y={table.offset_y}
      width={table.width || 60}
      height={table.height || 60}
      rotation={table.rotation || 0}
      draggable={false} // Siempre falso, el grupo hereda el drag
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(e.currentTarget, e.evt.shiftKey);
      }}
    >
      <Rect
        width={table.width || 60}
        height={table.height || 60}
        fill={hasActiveOrder ? "#ef4444" : "#4CAF50"} // ROJO si hay orden
        stroke={isSelected ? "#1976D2" : hasActiveOrder ? "#b91c1c" : "#388E3C"}
        strokeWidth={isSelected ? 3 : 2}
        cornerRadius={5}
        shadowBlur={5}
        shadowColor="black"
        shadowOpacity={0.2}
      />
      <KText
        text={`T${table.id}`}
        width={table.width || 60}
        height={table.height || 60}
        align="center"
        verticalAlign="middle"
        fill="white"
        fontSize={14}
        fontStyle="bold"
      />
    </Group>
  );
};

// ==========================================
// 2. EL MAPA PRINCIPAL
// ==========================================
const InteractiveFloorMap = ({ floorId }: { floorId: number }) => {
  const { data: floor, isLoading, isError } = useGetFloorPlanQuery(floorId);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  const [stageScale, setStageScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  const [updateTable] = useUpdateTableMutation();
  const [updateGroup] = useUpdateGroupMutation();
  const [createTable] = useCreateTableMutation();
  const [disbandGroup] = useDisbandGroupMutation();
  const [createGroup] = useCreateGroupMutation();

  const { data: activeOrders } = useGetActiveOrdersQuery(undefined, {
    pollingInterval: 5000,
  });
  const [syncBulkOrder] = useSyncBulkOrderMutation();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [inputMode, setInputMode] = useState<string>("manual");

  // NUEVO: Estado del Modo Edición
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const transformerRef = useRef<Konva.Transformer>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: dishes } = useGetDishesQuery();
  const [dishesMap, setDishesMap] = useState<{
    [key: number]: { dish: Dish; quantity: number };
  }>({});

  // Efecto para recuperar la orden si la mesa está ocupada
  useEffect(() => {
    if (selectedIds.length === 1 && dishes && activeOrders && floor) {
      const idStr = selectedIds[0];
      let targetGroupId = null;

      if (idStr.startsWith("group-")) {
        targetGroupId = parseInt(idStr.replace("group-", ""));
      } else if (idStr.startsWith("table-")) {
        const tId = parseInt(idStr.replace("table-", ""));
        const parentGroup = floor.table_groups.find((g) =>
          g.current_tables.some((t) => t.id === tId),
        );
        targetGroupId = parentGroup?.id;
      }

      if (targetGroupId) {
        const order = activeOrders.find(
          (o) => o.tablegroup_id === targetGroupId,
        );
        if (order) {
          const newMap: { [key: number]: { dish: Dish; quantity: number } } =
            {};
          order.detail.forEach((det) => {
            const d = dishes.find((dish) => dish.id === det.dish_id);
            if (d) newMap[d.id] = { dish: d, quantity: det.quantity };
          });
          setDishesMap(newMap);
        } else {
          setDishesMap({});
        }
      }
    } else {
      setDishesMap({});
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
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const scaleBy = 1.05;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setStageScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) setSelectedIds([]);
  };

  const handleNodeSelect = (node: Konva.Node, isShiftPressed: boolean) => {
    const id = node.id();

    if (id.startsWith("group-")) {
      if (isShiftPressed) {
        setSelectedIds((prev) =>
          prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
        );
      } else {
        setSelectedIds([id]);
      }
      return;
    }

    const tableIdMatch = id.match(/table-(\d+)/);
    if (tableIdMatch) {
      const tId = parseInt(tableIdMatch[1]);
      const parentGroup = floor?.table_groups.find((g) =>
        g.current_tables.some((t) => t.id === tId),
      );

      if (parentGroup) {
        const groupId = `group-${parentGroup.id}`;

        if (parentGroup.current_tables.length > 1) {
          if (selectedIds.length === 1 && selectedIds[0] === groupId) {
            setSelectedIds([id]);
          } else {
            setSelectedIds([groupId]);
          }
        } else {
          if (isShiftPressed) {
            setSelectedIds((prev) =>
              prev.includes(groupId)
                ? prev.filter((p) => p !== groupId)
                : [...prev, groupId],
            );
          } else {
            setSelectedIds([groupId]);
          }
        }
      }
    }
  };

  // --- LÓGICA DE HERRAMIENTAS ---
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
      if (id.startsWith("table-"))
        tableIds.push(parseInt(id.replace("table-", "")));
      else if (id.startsWith("group-")) {
        const groupId = parseInt(id.replace("group-", ""));
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
    const logicalX =
      (absPos.x - stageRef.current!.x()) / stageRef.current!.scaleX();
    const logicalY =
      (absPos.y - stageRef.current!.y()) / stageRef.current!.scaleY();

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
    if (selectedIds.length === 1 && selectedIds[0].startsWith("group-")) {
      const groupId = parseInt(selectedIds[0].replace("group-", ""));
      const targetGroup = floor?.table_groups.find((g) => g.id === groupId);

      if (targetGroup) {
        if (targetGroup.current_tables.length > 1) {
          await disbandGroup(groupId).unwrap();
          setSelectedIds([]);
        } else {
          console.log(
            `Llamar API DELETE para Mesa: ${targetGroup.current_tables[0].id}`,
          );
          setSelectedIds([]);
        }
      }
      return;
    }

    if (selectedIds.length === 1 && selectedIds[0].startsWith("table-")) {
      const tableId = parseInt(selectedIds[0].replace("table-", ""));
      const targetGroup = floor?.table_groups.find((g) =>
        g.current_tables.some((t) => t.id === tableId),
      );
      const targetTable = targetGroup?.current_tables.find(
        (t) => t.id === tableId,
      );

      if (!targetGroup || !targetTable) return;

      const tableNode = stageRef.current?.findOne(`#table-${tableId}`);
      if (!tableNode) return;

      const absPos = tableNode.getAbsolutePosition();
      const absRot = tableNode.getAbsoluteRotation();
      const logicalX =
        (absPos.x - stageRef.current!.x()) / stageRef.current!.scaleX();
      const logicalY =
        (absPos.y - stageRef.current!.y()) / stageRef.current!.scaleY();

      updateTable({
        tableId: tableId,
        current_group_id: targetTable.base_group_id,
        offset_x: logicalX,
        offset_y: logicalY,
        rotation: absRot,
      });
      setSelectedIds([`group-${targetTable.base_group_id}`]);
    }
  };

  // --- REGLAS VISUALES Y DE BOTONES ---
  const isMultipleSelected = selectedIds.length > 1;
  const isGroupSelected =
    selectedIds.length === 1 && selectedIds[0].startsWith("group-");
  const isSubSelectedTable =
    selectedIds.length === 1 && selectedIds[0].startsWith("table-");

  let isComplexGroup = false;
  let currentTargetGroupId = null;

  if (isGroupSelected) {
    const groupId = parseInt(selectedIds[0].replace("group-", ""));
    currentTargetGroupId = groupId;
    const g = floor?.table_groups.find((gr) => gr.id === groupId);
    if (g && g.current_tables.length > 1) isComplexGroup = true;
  } else if (isSubSelectedTable) {
    const tId = parseInt(selectedIds[0].replace("table-", ""));
    const g = floor?.table_groups.find((gr) =>
      gr.current_tables.some((t) => t.id === tId),
    );
    currentTargetGroupId = g?.id;
  }

  // Verificamos si la selección actual tiene una orden activa
  const hasActiveOrder = activeOrders?.some(
    (o) => o.tablegroup_id === currentTargetGroupId,
  );

  const disableScale = isMultipleSelected || isComplexGroup;

  // FIX: El Transformer solo aparece si estamos en Modo Edición
  const showTransformer =
    isEditMode && selectedIds.length > 0 && !isSubSelectedTable;

  let btnUngroupText = "Eliminar Mesa";
  if (isGroupSelected && isComplexGroup) btnUngroupText = "Desarmar Grupo";
  if (isSubSelectedTable) btnUngroupText = "Extraer de Grupo";

  const shouldShowSidebar = selectedIds.length === 1 && !isSubSelectedTable;

  let displayLabel = "";
  if (shouldShowSidebar) {
    const idStr = selectedIds[0];
    if (isComplexGroup) {
      displayLabel = `Pedido de Grupo ${idStr.replace("group-", "")}`;
    } else if (idStr.startsWith("group-")) {
      const gId = parseInt(idStr.replace("group-", ""));
      const g = floor?.table_groups.find((gr) => gr.id === gId);
      if (g && g.current_tables.length > 0) {
        displayLabel = `Pedido de Mesa ${g.current_tables[0].id}`;
      }
    }
  }

  if (isLoading)
    return <div style={{ padding: 20 }}>Cargando plano del restaurante...</div>;
  if (isError || !floor)
    return <div style={{ padding: 20 }}>Error al cargar el plano.</div>;

  return (
    <YStack f={1} gap={"$3"}>
      {/* BARRA DE HERRAMIENTAS - AHORA CON TOGGLE DE EDICIÓN */}
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
        <XStack gap="$3" ai="center">
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

        <Button
          size="$3"
          icon={isEditMode ? Lock : Pencil}
          onPress={() => {
            setIsEditMode(!isEditMode);
            setSelectedIds([]);
          }}
        >
          {isEditMode ? "Bloquear Mapa" : "Editar Mapa"}
        </Button>
      </XStack>

      <XStack f={1} gap={"$5"}>
        {/* LIENZO KONVA */}
        <Card bw={2} boc="$cardBorder" bg="$cardBg" br="$6" f={1}>
          <YStack f={1} overflow="hidden">
            <div
              ref={containerRef}
              style={{ width: "100%", height: "100%", borderRadius: "$6" }}
            >
              <Stage
                ref={stageRef}
                width={dimensions.width}
                height={dimensions.height}
                draggable={true}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stagePos.x}
                y={stagePos.y}
                onWheel={handleWheel}
                onDragEnd={(e) => {
                  if (e.target === e.target.getStage())
                    setStagePos({ x: e.target.x(), y: e.target.y() });
                }}
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                style={{ cursor: "grab" }}
              >
                <Layer>
                  {floor.table_groups?.map((group) => {
                    const groupId = `group-${group.id}`;
                    const groupHasActiveOrder = activeOrders?.some(
                      (o) => o.tablegroup_id === group.id,
                    );

                    return (
                      <Group
                        key={groupId}
                        id={groupId}
                        x={group.pos_x}
                        y={group.pos_y}
                        rotation={group.rotation}
                        draggable={isEditMode} // <-- FIX: Solo arrastrable en modo edición
                        onClick={(e) => {
                          e.cancelBubble = true;
                          handleNodeSelect(e.currentTarget, e.evt.shiftKey);
                        }}
                        onDragEnd={(e) => {
                          if (e.target !== e.currentTarget) return;
                          e.cancelBubble = true;
                          updateGroup({
                            groupId: group.id,
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

                          updateGroup({
                            groupId: group.id,
                            pos_x: node.x(),
                            pos_y: node.y(),
                            rotation: node.rotation(),
                          });

                          if (group.current_tables.length === 1) {
                            const innerTable = group.current_tables[0];
                            const newWidth = Math.max(
                              20,
                              Math.abs((innerTable.width || 60) * scaleX),
                            );
                            const newHeight = Math.max(
                              20,
                              Math.abs((innerTable.height || 60) * scaleY),
                            );
                            updateTable({
                              tableId: innerTable.id,
                              width: newWidth,
                              height: newHeight,
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
                      enabledAnchors={
                        disableScale
                          ? []
                          : [
                              "top-left",
                              "top-center",
                              "top-right",
                              "middle-right",
                              "bottom-right",
                              "bottom-center",
                              "bottom-left",
                              "middle-left",
                            ]
                      }
                      resizeEnabled={!disableScale}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 20 || newBox.height < 20)
                          return oldBox;
                        return newBox;
                      }}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          </YStack>
        </Card>

        {/* SIDEBAR DEL CARRITO */}
        {shouldShowSidebar && (
          <YStack
            bw={2}
            boc="$cardBorder"
            bg="$cardBg"
            br="$6"
            overflow="hidden"
            w={350}
          >
            <XStack
              w={"100%"}
              backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
              p={"$3"}
              gap={"$3"}
              ai={"center"}
            >
              <ShoppingCart col={"$white"} size={20} />
              <Text col={"$white"} fow="500">
                {displayLabel}
              </Text>
            </XStack>
            <Tabs
              defaultValue="manual"
              f={1}
              value={inputMode}
              onValueChange={setInputMode}
              flexDirection="column"
            >
              <Tabs.List
                p={"$3"}
                w="100%"
                bbw={2}
                bbc="$cardBorder"
                bg="$cardBg"
                gap={"$2"}
                br={0}
              >
                <Tabs.Tab
                  br={"$3"}
                  f={1}
                  value="manual"
                  bc={inputMode === "manual" ? "transparent" : "$amber100"}
                  backgroundImage={
                    inputMode === "manual"
                      ? "linear-gradient(to right, var(--brandMain), var(--orange500))"
                      : undefined
                  }
                >
                  <CookingPot
                    col={inputMode === "manual" ? "$white" : undefined}
                    size={16}
                    mr={"$2"}
                  />
                  <SizableText
                    col={inputMode === "manual" ? "$white" : undefined}
                  >
                    Manual
                  </SizableText>
                </Tabs.Tab>

                <Tabs.Tab
                  br={"$3"}
                  f={1}
                  value="ai"
                  bc={inputMode === "ai" ? "transparent" : "$amber100"}
                  backgroundImage={
                    inputMode === "ai"
                      ? "linear-gradient(to right, var(--brandMain), var(--orange500))"
                      : undefined
                  }
                >
                  <BrainCircuit
                    col={inputMode === "ai" ? "$white" : undefined}
                    size={16}
                    mr={"$2"}
                  />
                  <SizableText col={inputMode === "ai" ? "$white" : undefined}>
                    IA
                  </SizableText>
                </Tabs.Tab>
              </Tabs.List>

              <ScrollView
                f={1}
                showsVerticalScrollIndicator={false}
                bbw={2}
                boc={"$cardBorder"}
              >
                <YStack px={"$3"} gap={"$3"} py={0}>
                  {Object.keys(dishesMap).length > 0 && (
                    <Text pt={"$3"}>🍽️ Pedido Actual</Text>
                  )}
                  {Object.keys(dishesMap).length > 0 &&
                    Object.values(dishesMap).map((e, i) => (
                      <YStack
                        p={"$3"}
                        key={i}
                        gap={"$2"}
                        backgroundColor={"$amber50"}
                        br={"$3"}
                        boc={"$cardBorder"}
                        bw={2}
                      >
                        <XStack jc={"space-between"}>
                          <Text>{e.dish.name}</Text>
                          <Text>Bs. {e.dish.price}</Text>
                        </XStack>
                        <XStack
                          ai={"center"}
                          f={1}
                          jc={"space-between"}
                          gap={"$2"}
                        >
                          <XStack ai={"center"} f={1} jc={"space-between"}>
                            <View
                              w={30}
                              h={30}
                              br={"$3"}
                              bg={"$amber200"}
                              ai={"center"}
                              jc={"center"}
                              hoverStyle={{ backgroundColor: "$amber500" }}
                              onPress={() => {
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
                                });
                              }}
                            >
                              <Minus size={12} />
                            </View>
                            <Text>{e.quantity}</Text>
                            <View
                              w={30}
                              h={30}
                              br={"$3"}
                              bg={"$amber200"}
                              ai={"center"}
                              jc={"center"}
                              hoverStyle={{ backgroundColor: "$amber500" }}
                              onPress={() => {
                                setDishesMap((prev) => {
                                  const existing = prev[e.dish.id];
                                  return {
                                    ...prev,
                                    [e.dish.id]: {
                                      dish: e.dish,
                                      quantity: existing
                                        ? existing.quantity + 1
                                        : 1,
                                    },
                                  };
                                });
                              }}
                            >
                              <Plus size={12} />
                            </View>
                          </XStack>
                          <View
                            w={30}
                            h={30}
                            br={"$3"}
                            bg={"$red500"}
                            ai={"center"}
                            jc={"center"}
                            hoverStyle={{ backgroundColor: "$red700" }}
                            onPress={() => {
                              setDishesMap((prev) => {
                                const newMap = { ...prev };
                                delete newMap[e.dish.id];
                                return newMap;
                              });
                            }}
                          >
                            <Trash size={12} col={"$white"} />
                          </View>
                        </XStack>
                      </YStack>
                    ))}
                  {Object.keys(dishesMap).length > 0 && (
                    <XStack
                      jc={"space-between"}
                      btw={2}
                      boc={"$cardBorder"}
                      pt={"$3"}
                    >
                      <Text>Total:</Text>
                      <Text>
                        Bs.{" "}
                        {Object.values(dishesMap)
                          .reduce(
                            (tot, item) =>
                              tot + item.dish.price * item.quantity,
                            0,
                          )
                          .toFixed(2)}
                      </Text>
                    </XStack>
                  )}
                </YStack>

                {Object.values(dishesMap).length > 0 && (
                  <View w={"100%"} boc={"$cardBorder"} bbw={2} pt={"$3"} />
                )}

                <Tabs.Content value="manual" f={1}>
                  <YStack p={"$3"} gap={"$3"}>
                    <XStack>
                      <Plus size={20} mr={"$2"} col={"$amber700"} />
                      <Text>Agregar Items</Text>
                    </XStack>
                    {dishes &&
                      dishes.map((d) => (
                        <Button
                          key={d.id}
                          gap={"$2"}
                          ai={"center"}
                          jc={"space-between"}
                          boc={"$cardBorder"}
                          bw={2}
                          p={"$3"}
                          br={"$3"}
                          hoverStyle={{ backgroundColor: "$amber100" }}
                          onPress={() => {
                            setDishesMap((prev) => {
                              const existing = prev[d.id];
                              return {
                                ...prev,
                                [d.id]: {
                                  dish: d,
                                  quantity: existing
                                    ? existing.quantity + 1
                                    : 1,
                                },
                              };
                            });
                          }}
                        >
                          <Text>{d.name}</Text>
                          <Text col={"$amber700"}> Bs. {d.price}</Text>
                        </Button>
                      ))}
                  </YStack>
                </Tabs.Content>
                <Tabs.Content value="ai" f={1}>
                  <YStack p={"$3"} gap={"$3"}>
                    <Button
                      backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                      hoverStyle={{ scale: 1.02 }}
                    >
                      <Mic col="white" />
                      <Text col="white" fontWeight="600" fontFamily="$body">
                        Iniciar pedido por voz
                      </Text>
                    </Button>
                    <View position="relative">
                      <Input
                        placeholder="Ej: Quisiera dos hamburguesas..."
                        fos={"$5"}
                        numberOfLines={4}
                        f={1}
                        bw={2}
                        bc="$cardBorder"
                        bg="$cardBg"
                        outlineStyle="none"
                        outlineColor="transparent"
                        focusStyle={{ boc: "$brandMain" }}
                      />
                      <View
                        position={"absolute"}
                        b={"$2"}
                        r={"$2"}
                        w={30}
                        h={30}
                        br={"$3"}
                        backgroundImage={
                          "linear-gradient(to right, var(--brandMain), var(--orange500))"
                        }
                        ai={"center"}
                        jc={"center"}
                      >
                        <Send size={12} col={"$white"} />
                      </View>
                    </View>
                  </YStack>
                </Tabs.Content>
              </ScrollView>

              {/* FIX: BOTÓN INTELIGENTE DE CONFIRMAR/ACTUALIZAR */}
              <Button
                m={"$3"}
                backgroundImage="linear-gradient(to right, var(--brandMain), var(--orange500))"
                hoverStyle={{ scale: 1.02 }}
                disabled={Object.keys(dishesMap).length === 0}
                opacity={Object.keys(dishesMap).length === 0 ? 0.5 : 1}
                onPress={async () => {
                  if (currentTargetGroupId) {
                    const itemsToSync = Object.values(dishesMap).map(
                      (item) => ({
                        dish_id: item.dish.id,
                        quantity: item.quantity,
                        discount: 0,
                        status: "T",
                      }),
                    );

                    await syncBulkOrder({
                      tablegroup_id: currentTargetGroupId,
                      items: itemsToSync,
                    }).unwrap();
                    setSelectedIds([]); // Opcional: Cerrar el panel tras guardar
                  }
                }}
              >
                <Check col="white" />
                <Text col="white" fontWeight="600" fontFamily="$body">
                  {hasActiveOrder ? "Actualizar pedido" : "Confirmar pedido"}
                </Text>
              </Button>
            </Tabs>
          </YStack>
        )}
      </XStack>
    </YStack>
  );
};
