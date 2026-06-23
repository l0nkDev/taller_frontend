import { useEffect, useState } from 'react';
import { Group, Image as KonvaImage } from 'react-konva';

export function HeatmapLayer({ showHeatmap, optState, heatmapData }: any) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!(showHeatmap || optState !== 'idle') || !heatmapData) {
      setImage(null);
      return;
    }

    const { rows, cols, CELL, heatmap, maxVal } = heatmapData;
    const canvas = document.createElement('canvas');
    canvas.width = cols * CELL;
    canvas.height = rows * CELL;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const val = heatmap[r * cols + c];
          if (val !== 1000000) {
            const ratio = val / maxVal;
            ctx.fillStyle = `hsl(${(1 - ratio) * 120}, 100%, 50%)`;
            ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
          }
        }
      }

      const img = new Image();
      img.src = canvas.toDataURL();
      img.onload = () => {
        setImage(img);
      };
    }
  }, [showHeatmap, optState, heatmapData]);

  if (!image || !(showHeatmap || optState !== 'idle') || !heatmapData) return null;

  return (
    <Group opacity={0.4} listening={false}>
      <KonvaImage
        x={heatmapData.minX}
        y={heatmapData.minY}
        image={image}
      />
    </Group>
  );
}
