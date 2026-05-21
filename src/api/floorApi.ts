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

export interface FloorRead {
  id: number;
  name: string;
  table_groups: TableGroupRead[];
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
        offset_x?: number;
        offset_y?: number;
        rotation?: number;
        width?: number;
        height?: number;
        current_group_id?: number;
      }
    >({
      query: ({ tableId, ...patch }) => ({
        url: `/editor/tables/${tableId}`,
        method: "PATCH",
        body: patch,
      }),
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
      { groupId: number; pos_x?: number; pos_y?: number; rotation?: number }
    >({
      query: ({ groupId, ...patch }) => ({
        url: `/editor/tablegroups/${groupId}`,
        method: "PATCH",
        body: patch,
      }),
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
} = floorApi;
