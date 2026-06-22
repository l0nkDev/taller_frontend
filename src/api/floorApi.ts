import { apiUrl, baseApi } from "./baseApi";

export interface TableRead {
  id: number;
  width: number;
  height: number;
  base_group_id: number;
  current_group_id: number;
  offset_x: number;
  offset_y: number;
  rotation: number;
}

export interface TableGroupRead {
  id: number;
  floor_id: number;
  pos_x: number;
  pos_y: number;
  rotation: number;
  capacity: number;
  current_tables: TableRead[];
}

export interface WallRead {
  id: number;
  floor_id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isDoor: boolean;
}

export interface FloorRead {
  id: number;
  name: string;
  table_groups: TableGroupRead[];
  walls: WallRead[];
  capacity: number;
}

export interface ParsedOrderItem {
  dish_id: number;
  name: string;
  quantity: number;
}

export interface AIOrderResponse {
  transcription: string;
  items: ParsedOrderItem[];
}

export const floorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFloors: builder.query<FloorRead[], void>({
      query: () => "/floors",
      providesTags: ["Floors"],
    }),
    createFloor: builder.mutation<FloorRead, string>({
      query: (name) => ({ url: "/floors", method: "POST", body: { name } }),
      invalidatesTags: ["Floors"],
    }),
    updateFloor: builder.mutation<FloorRead, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/floors/${id}`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["Floors"],
    }),
    getFloorPlan: builder.query<FloorRead, number>({
      providesTags: ['Floor'],
      query: (floorId) => `/editor/floor/${floorId}`,
      async onCacheEntryAdded(
        floorId,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const eventSource = new EventSource(
          `${apiUrl}/editor/floor/${floorId}/stream`,
        );

        try {
          await cacheDataLoaded;

          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("📡 SSE Evento:", data.action, data);

            updateCachedData((draft) => {
              const removeTableFromAnyGroup = (tableId: number) => {
                const oldGroup = draft.table_groups.find((g) =>
                  g.current_tables.some((t) => t.id === tableId),
                );
                if (oldGroup) {
                  oldGroup.current_tables = oldGroup.current_tables.filter(
                    (t) => t.id !== tableId,
                  );
                }
              };

              const addOrOverwriteGroup = (group: TableGroupRead) => {
                if (!group) return;

                const index = draft.table_groups.findIndex(
                  (g) => g.id === group.id,
                );
                if (index !== -1) {
                  draft.table_groups[index] = group;
                } else {
                  draft.table_groups.push(group);
                }
              };

              switch (data.action) {
                case "create_table": {
                  addOrOverwriteGroup(data.base_group);
                  addOrOverwriteGroup(data.current_group);
                  break;
                }
                case "update_table": {
                  removeTableFromAnyGroup(data.table.id);
                  addOrOverwriteGroup(data.base_group);
                  if (data.current_group.id !== data.base_group.id) {
                    addOrOverwriteGroup(data.current_group);
                  }
                  break;
                }
                case "create_group":
                case "update_group": {
                  const incomingGroup = data.tablegroup;
                  if (!incomingGroup) break;

                  incomingGroup.current_tables.forEach((t: TableRead) => {
                    removeTableFromAnyGroup(t.id);
                  });
                  addOrOverwriteGroup(incomingGroup);
                  break;
                }
                case "create_wall":
                  if (!draft.walls) draft.walls = [];
                  draft.walls.push(data.wall);
                  break;
                case "update_wall": {
                  if (!draft.walls) draft.walls = [];
                  const idx = draft.walls.findIndex(w => w.id === data.wall.id);
                  if (idx !== -1) draft.walls[idx] = data.wall;
                  break;
                }
                case "delete_wall":
                  if (!draft.walls) draft.walls = [];
                  draft.walls = draft.walls.filter(w => w.id !== data.wall_id);
                  break;
              }
            });
          };
        } catch (error) {
          console.error("Error en SSE:", error);
        }

        await cacheEntryRemoved;
        eventSource.close();
      },
    }),
    updateTable: builder.mutation<
      void,
      {
        tableId: number;
        floor_id: number;
        offset_x?: number;
        offset_y?: number;
        rotation?: number;
        width?: number;
        height?: number;
        current_group_id?: number;
      }
    >({
      query: ({ tableId, floor_id, ...patch }) => ({
        url: `/editor/tables/${tableId}`,
        method: "PATCH",
        body: patch,
      }),
      async onQueryStarted({ tableId, floor_id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          floorApi.util.updateQueryData('getFloorPlan', floor_id, (draft) => {
            for (const group of draft.table_groups) {
              const table = group.current_tables.find(t => t.id === tableId);
              if (table) {
                if (group.current_tables.length === 1 && group.id === table.base_group_id) {
                  if (patch.offset_x !== undefined) group.pos_x = patch.offset_x;
                  if (patch.offset_y !== undefined) group.pos_y = patch.offset_y;
                  if (patch.rotation !== undefined) group.rotation = patch.rotation;
                  
                  const { offset_x, offset_y, rotation, ...restPatch } = patch;
                  Object.assign(table, restPatch);
                  table.offset_x = 0;
                  table.offset_y = 0;
                } else {
                  Object.assign(table, patch);
                }
              }
            }
          })
        );
        try { await queryFulfilled; } catch { patchResult.undo(); }
      }
    }),
    createTable: builder.mutation<
      void,
      {
        capacity?: number;
        floor_id: number;
        offset_x?: number;
        offset_y?: number;
        rotation?: number;
        width?: number;
        height?: number;
        current_group_id?: number;
      }
    >({
      query: ({ ...patch }) => ({
        url: `/editor/tables`,
        method: "POST",
        body: patch,
      }),
    }),

    updateGroup: builder.mutation<
      void,
      { groupId: number; floor_id: number; pos_x?: number; pos_y?: number; rotation?: number }
    >({
      query: ({ groupId, floor_id, ...patch }) => ({
        url: `/editor/tablegroups/${groupId}`,
        method: "PATCH",
        body: patch,
      }),
      async onQueryStarted({ groupId, floor_id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          floorApi.util.updateQueryData('getFloorPlan', floor_id, (draft) => {
            const group = draft.table_groups.find(g => g.id === groupId);
            if (group) Object.assign(group, patch);
          })
        );
        try { await queryFulfilled; } catch { patchResult.undo(); }
      }
    }),
    disbandGroup: builder.mutation<void, number>({
      query: (groupId) => ({
        url: `/editor/tablegroups/${groupId}/disband`,
        method: "POST",
      }),
      invalidatesTags: ["Floor"],
    }),
    createGroup: builder.mutation<TableGroupRead, { floor_id: number; table_ids: number[]; pos_x: number; pos_y: number; rotation: number; capacity: number }>({
      query: (body) => ({
        url: `/editor/tablegroups`,
        method: 'POST',
        body,
      }),
    }),
    createWall: builder.mutation<WallRead, { floor_id: number; x1: number; y1: number; x2: number; y2: number; isDoor?: boolean }>({
      query: (body) => ({
        url: `/editor/walls`,
        method: 'POST',
        body,
      }),
      async onQueryStarted(body, { dispatch, queryFulfilled }) {
        const tempId = -Date.now();
        const patchResult = dispatch(
          floorApi.util.updateQueryData('getFloorPlan', body.floor_id, (draft) => {
            if (!draft.walls) draft.walls = [];
            draft.walls.push({ id: tempId, ...body, isDoor: body.isDoor || false });
          })
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            floorApi.util.updateQueryData('getFloorPlan', body.floor_id, (draft) => {
              const idx = draft.walls.findIndex(w => w.id === tempId);
              if (idx !== -1) draft.walls[idx] = data;
            })
          );
        } catch {
          patchResult.undo();
        }
      }
    }),
    updateWall: builder.mutation<void, { wallId: number; floor_id: number; x1?: number; y1?: number; x2?: number; y2?: number; isDoor?: boolean }>({
      query: ({ wallId, floor_id, ...patch }) => ({
        url: `/editor/walls/${wallId}`,
        method: "PATCH",
        body: patch,
      }),
      async onQueryStarted({ wallId, floor_id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          floorApi.util.updateQueryData('getFloorPlan', floor_id, (draft) => {
            if (!draft.walls) return;
            const wall = draft.walls.find(w => w.id === wallId);
            if (wall) Object.assign(wall, patch);
          })
        );
        try { await queryFulfilled; } catch { patchResult.undo(); }
      }
    }),
    deleteWall: builder.mutation<void, number>({
      query: (wallId) => ({
        url: `/editor/walls/${wallId}`,
        method: "DELETE",
      }),
    }),
    parseOrderAI: builder.mutation<AIOrderResponse, FormData>({
      query: (formData) => ({
        url: "/ai/parse-order",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetFloorPlanQuery,
  useUpdateGroupMutation,
  useUpdateTableMutation,
  useGetFloorsQuery,
  useCreateFloorMutation,
  useUpdateFloorMutation,
  useCreateTableMutation,
  useDisbandGroupMutation,
  useCreateGroupMutation,
  useCreateWallMutation,
  useUpdateWallMutation,
  useDeleteWallMutation,
  useParseOrderAIMutation,
} = floorApi;
