import { useState, useEffect } from 'react';
import { useUpdateGroupMutation } from '../../../api/floorApi';

export const useLayoutOptimizer = (floor: any, floorId: number) => {
  const [optState, setOptState] = useState<'idle' | 'optimizing' | 'preview'>('idle');
  const [previewPositions, setPreviewPositions] = useState<
    Record<number, { x: number; y: number; rotation: number }>
  >({});
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<{
    minX: number;
    minY: number;
    cols: number;
    rows: number;
    CELL: number;
    heatmap: Int32Array;
    grid: Int8Array;
    maxVal: number;
  } | null>(null);

  const [updateGroup] = useUpdateGroupMutation();

  useEffect(() => {
    if (!floor?.walls || floor.walls.length === 0) return;
    const { walls } = floor;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    walls.forEach((w: any) => {
      minX = Math.min(minX, w.x1, w.x2);
      maxX = Math.max(maxX, w.x1, w.x2);
      minY = Math.min(minY, w.y1, w.y2);
      maxY = Math.max(maxY, w.y1, w.y2);
    });
    if (minX === Infinity) return;

    minX -= 30;
    maxX += 30;
    minY -= 30;
    maxY += 30;

    const CELL = 10;
    const cols = Math.ceil((maxX - minX) / CELL);
    const rows = Math.ceil((maxY - minY) / CELL);

    const grid = new Int8Array(cols * rows);
    const SET_GRID = (c: number, r: number, val: number) => {
      if (c >= 0 && c < cols && r >= 0 && r < rows) grid[r * cols + c] = val;
    };

    const doorCells = new Set<string>();

    walls.forEach((w: any) => {
      const steps = Math.ceil(Math.sqrt((w.x2 - w.x1) ** 2 + (w.y2 - w.y1) ** 2) / (CELL / 2));
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const px = w.x1 + t * (w.x2 - w.x1);
        const py = w.y1 + t * (w.y2 - w.y1);
        const c = Math.floor((px - minX) / CELL);
        const r = Math.floor((py - minY) / CELL);
        const pad = 3;
        for (let dr = -pad; dr <= pad; dr += 1) {
          for (let dc = -pad; dc <= pad; dc += 1) {
            SET_GRID(c + dc, r + dr, 1);
            if (w.isDoor) doorCells.add(`${c + dc},${r + dr}`);
          }
        }
      }
    });

    const heatmap = new Int32Array(cols * rows).fill(1000000);
    const queue: { c: number; r: number; dist: number }[] = [];

    for (const d of doorCells) {
      const parts = d.split(',');
      const c = parseInt(parts[0], 10);
      const r = parseInt(parts[1], 10);
      heatmap[r * cols + c] = 0;
      queue.push({ c, r, dist: 0 });
    }

    let head = 0;
    let maxVal = 0;
    while (head < queue.length) {
      const curr = queue[head];
      head += 1;
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ];
      for (const dir of dirs) {
        const nc = curr.c + dir[0];
        const nr = curr.r + dir[1];
        if (nc >= 0 && nc < cols && nr >= 0 && nr < rows) {
          if (grid[nr * cols + nc] === 1 && !doorCells.has(`${nc},${nr}`)) continue;
          if (curr.dist + 1 < heatmap[nr * cols + nc]) {
            heatmap[nr * cols + nc] = curr.dist + 1;
            maxVal = Math.max(maxVal, curr.dist + 1);
            queue.push({ c: nc, r: nr, dist: curr.dist + 1 });
          }
        }
      }
    }

    // Traffic Lanes Optimization
    const doorCenters: { x: number; y: number }[] = [];
    walls.forEach((w: any) => {
      if (w.isDoor) {
        doorCenters.push({ x: (w.x1 + w.x2) / 2, y: (w.y1 + w.y2) / 2 });
      }
    });

    const drawLane = (x1: number, y1: number, x2: number, y2: number) => {
      const steps = Math.ceil(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) / (CELL / 2));
      for (let i = 0; i <= steps; i += 1) {
        const t = i / steps;
        const px = x1 + t * (x2 - x1);
        const py = y1 + t * (y2 - y1);
        const c = Math.floor((px - minX) / CELL);
        const r = Math.floor((py - minY) / CELL);
        const pad = 2; // 2 cells padding = 20px each side = 50px lane width total
        for (let dr = -pad; dr <= pad; dr += 1) {
          for (let dc = -pad; dc <= pad; dc += 1) {
            if (grid[(r + dr) * cols + (c + dc)] !== 1) {
              SET_GRID(c + dc, r + dr, 2);
            }
          }
        }
      }
    };

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    for (const door of doorCenters) {
      drawLane(door.x, door.y, centerX, centerY);
    }

    setHeatmapData({ minX, minY, cols, rows, CELL, heatmap, grid, maxVal });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floor?.walls]);

  useEffect(() => {
    if (optState === 'preview') {
      setOptState('idle');
      setPreviewPositions({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floor?.table_groups, floor?.walls]);

  const applyOptimization = async () => {
    setOptState('optimizing');
    try {
      for (const [idStr, pos] of Object.entries(previewPositions)) {
        await updateGroup({
          groupId: parseInt(idStr, 10),
          floor_id: floorId,
          pos_x: pos.x,
          pos_y: pos.y,
          rotation: pos.rotation,
        }).unwrap();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptState('idle');
      setPreviewPositions({});
    }
  };

  const runOptimization = async () => {
    if (!floor?.walls || floor.walls.length === 0 || !heatmapData) return;
    setOptState('optimizing');
    await new Promise((r) => setTimeout(r, 100)); // allow UI to render 'Calculando...'

    const groups = floor.table_groups || [];
    const { minX, minY, cols, rows, CELL, heatmap, grid } = heatmapData;

    const sortedGroups = [...groups].sort(
      (a: any, b: any) => b.current_tables.length - a.current_tables.length,
    );
    const preview: Record<number, { x: number; y: number; rotation: number }> = {};

    const currentGrid = new Int8Array(grid);
    const LOCAL_SET_GRID = (c: number, r: number, val: number) => {
      if (c >= 0 && c < cols && r >= 0 && r < rows) currentGrid[r * cols + c] = val;
    };
    const LOCAL_GRID = (c: number, r: number) => {
      if (c < 0 || c >= cols || r < 0 || r >= rows) return 1;
      return currentGrid[r * cols + c];
    };

    for (const g of sortedGroups) {
      let bestScore = -Infinity;
      let bestX = g.pos_x;
      let bestY = g.pos_y;
      let bestRot = g.rotation || 0;

      for (const rot of [0, 90, 180, 270]) {
        for (let r = 2; r < rows - 2; r += 2) {
          for (let c = 2; c < cols - 2; c += 2) {
            const px = minX + c * CELL;
            const py = minY + r * CELL;

            const cells: { c: number; r: number }[] = [];
            let maxR = 0;
            g.current_tables.forEach((t: any) => {
              const w = (t.width || 60) * (t.scaleX || 1);
              const h = (t.height || 60) * (t.scaleY || 1);
              const ox = t.offset_x || 0;
              const oy = t.offset_y || 0;
              const tRot = t.rotation || 0;
              const gRot = rot;
              const absTRot = (tRot + gRot) % 360;

              const rad = (gRot * Math.PI) / 180;
              const cos = Math.cos(rad);
              const sin = Math.sin(rad);
              const absTx = px + ox * cos - oy * sin;
              const absTy = py + ox * sin + oy * cos;

              const rrad = (-absTRot * Math.PI) / 180;
              const rcos = Math.cos(rrad);
              const rsin = Math.sin(rrad);

              const R = Math.sqrt(w * w + h * h) + 5;
              if (R > maxR) maxR = R;

              const startC = Math.floor((absTx - R - minX) / CELL);
              const endC = Math.floor((absTx + R - minX) / CELL);
              const startR = Math.floor((absTy - R - minY) / CELL);
              const endR = Math.floor((absTy + R - minY) / CELL);

              for (let rr = startR; rr <= endR; rr += 1) {
                for (let cc = startC; cc <= endC; cc += 1) {
                  const cx = minX + cc * CELL;
                  const cy = minY + rr * CELL;
                  const lx = cx - absTx;
                  const ly = cy - absTy;
                  const locX = lx * rcos - ly * rsin;
                  const locY = lx * rsin + ly * rcos;
                  if (locX >= 0 && locX <= w && locY >= 0 && locY <= h) {
                    cells.push({ c: cc, r: rr });
                  }
                }
              }
            });

            let penalty = 0;
            let heatSum = 0;
            if (cells.length === 0) {
              penalty += 100000;
            } else {
              for (const cell of cells) {
                const val = LOCAL_GRID(cell.c, cell.r);
                if (val === 1) {
                  penalty += 100000;
                } else if (val === 2) {
                  heatSum += 500; // Traffic lane penalty
                } else if (val === 3) {
                  heatSum += 200; // Preferred spacing soft penalty
                }
                heatSum += heatmap[cell.r * cols + cell.c];
              }
            }

            if (penalty === 0) {
              const score = -heatSum * 1000;
              if (score > bestScore) {
                bestScore = score;
                bestX = px;
                bestY = py;
                bestRot = rot;
              }
            }
          }
        }
      }

      if (bestScore > -Infinity) {
        preview[g.id] = { x: bestX, y: bestY, rotation: bestRot };

        const rot = bestRot;
        g.current_tables.forEach((t: any) => {
          const w = (t.width || 60) * (t.scaleX || 1);
          const h = (t.height || 60) * (t.scaleY || 1);
          const ox = t.offset_x || 0;
          const oy = t.offset_y || 0;
          const tRot = t.rotation || 0;
          const gRot = rot;
          const absTRot = (tRot + gRot) % 360;

          const rad = (gRot * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          const absTx = bestX + ox * cos - oy * sin;
          const absTy = bestY + ox * sin + oy * cos;

          const rrad = (-absTRot * Math.PI) / 180;
          const rcos = Math.cos(rrad);
          const rsin = Math.sin(rrad);

          const R = Math.sqrt(w * w + h * h) + 5;
          const startC = Math.floor((absTx - R - minX) / CELL);
          const endC = Math.floor((absTx + R - minX) / CELL);
          const startR = Math.floor((absTy - R - minY) / CELL);
          const endR = Math.floor((absTy + R - minY) / CELL);

          for (let rr = startR; rr <= endR; rr += 1) {
            for (let cc = startC; cc <= endC; cc += 1) {
              const cx = minX + cc * CELL;
              const cy = minY + rr * CELL;
              const lx = cx - absTx;
              const ly = cy - absTy;
              const locX = lx * rcos - ly * rsin;
              const locY = lx * rsin + ly * rcos;
              if (locX >= -20 && locX <= w + 20 && locY >= -20 && locY <= h + 20) {
                // 20px hard limit padding
                LOCAL_SET_GRID(cc, rr, 1);
              } else if (locX >= -40 && locX <= w + 40 && locY >= -40 && locY <= h + 40) {
                // 40px preferred soft padding
                if (LOCAL_GRID(cc, rr) !== 1) {
                  LOCAL_SET_GRID(cc, rr, 3);
                }
              }
            }
          }
        });
        console.log(
          `✅ Table ${g.id} placed at (${bestX}, ${bestY}) with rot ${bestRot}. Score: ${bestScore}`,
        );
      } else {
        console.warn(
          `❌ Table ${g.id} FAILED TO PLACE! Falling back to original. Groups size: ${g.current_tables.length}`,
        );
        preview[g.id] = { x: g.pos_x, y: g.pos_y, rotation: g.rotation || 0 };
      }
    }

    console.log('=== FINAL PREVIEW === ', preview);
    setPreviewPositions(preview);
    setOptState('preview');
  };

  return {
    optState,
    setOptState,
    previewPositions,
    setPreviewPositions,
    showHeatmap,
    setShowHeatmap,
    heatmapData,
    runOptimization,
    applyOptimization,
  };
};
