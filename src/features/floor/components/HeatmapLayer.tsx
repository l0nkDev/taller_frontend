import { Group, Rect } from 'react-konva';

export const HeatmapLayer = ({ showHeatmap, optState, heatmapData }: any) => {
  if (!(showHeatmap || optState !== "idle") || !heatmapData) return null;

  return (
    <Group>
      {Array.from({ length: heatmapData.rows }).map((_, r) =>
        Array.from({ length: heatmapData.cols }).map((_, c) => {
          const val = heatmapData.heatmap[r * heatmapData.cols + c];
          if (val === 1000000) return null;
          const ratio = val / heatmapData.maxVal;
          const color = `hsl(${(1 - ratio) * 120}, 100%, 50%)`;
          return (
            <Rect
              key={`${r}-${c}`}
              x={heatmapData.minX + c * heatmapData.CELL}
              y={heatmapData.minY + r * heatmapData.CELL}
              width={heatmapData.CELL}
              height={heatmapData.CELL}
              fill={color}
              opacity={0.4}
              listening={false}
            />
          );
        })
      )}
    </Group>
  );
};
