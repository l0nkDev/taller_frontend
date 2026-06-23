import { Group, Rect, Text as KText } from 'react-konva';
import Konva from 'konva';
import { TableRead } from '../../../api/floorApi';

export function TableNode({
  table,
  isSelected,
  onSelect,
  hasActiveOrder,
}: {
  table: TableRead;
  isSelected: boolean;
  onSelect: (node: Konva.Node, isShiftPressed: boolean) => void;
  hasActiveOrder: boolean;
}) {
  return (
    <Group
      id={`table-${table.id}`}
      x={table.offset_x}
      y={table.offset_y}
      width={table.width || 60}
      height={table.height || 60}
      rotation={table.rotation || 0}
      draggable={false}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect(e.currentTarget, e.evt.shiftKey);
      }}
    >
      <Rect
        width={table.width || 60}
        height={table.height || 60}
        fill={hasActiveOrder ? '#ef4444' : '#4CAF50'}
        stroke={isSelected ? '#1976D2' : hasActiveOrder ? '#b91c1c' : '#388E3C'}
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
}
