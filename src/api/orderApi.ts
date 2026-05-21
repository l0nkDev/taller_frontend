import { apiUrl, baseApi } from "./baseApi";

// ==========================================
// INTERFACES (Espejo de tus schemas de Python)
// ==========================================
export interface OrderDetailRead {
  id: number;
  dish_id: number;
  dish_price: number;
  dish_name: string;
  quantity: number;
  order_id: number;
  discount: number;
  status: "T" | "K" | "C" | "R" | "S" | "X";
}

export interface OrderRead {
  id: number;
  tablegroup_id: number;
  was_paid: boolean;
  was_cancelled: boolean;
  detail: OrderDetailRead[];
}

export interface OrderItemCreate {
  dish_id: number;
  quantity: number;
  discount?: number;
  status?: string;
}

export interface OrderBulkSync {
  tablegroup_id: number;
  items: OrderItemCreate[];
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveOrders: builder.query<OrderRead[], void>({
      query: () => "/orders/active",
      providesTags: ["Orders"],
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
      ) {
        const eventSource = new EventSource(`${apiUrl}/orders/stream`);
        try {
          await cacheDataLoaded;
          eventSource.onmessage = (event) => {
            const eventData = JSON.parse(event.data);

            updateCachedData((draft) => {
              if (eventData.action === "update_order") {
                const incomingOrder = eventData.data;
                const index = draft.findIndex((o) => o.id === incomingOrder.id);
                if (index !== -1) {
                  draft[index] = incomingOrder;
                } else {
                  draft.push(incomingOrder);
                }
              } else if (eventData.action === "remove_order") {
                return draft.filter((o) => o.id !== eventData.data.order_id);
              }
            });
          };
        } catch (error) {
          console.error("Error en SSE de Órdenes:", error);
        }

        await cacheEntryRemoved;
        eventSource.close();
      },
    }),
    syncBulkOrder: builder.mutation<OrderRead, OrderBulkSync>({
      query: (body) => ({
        url: `/orders/bulk-sync`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Orders"],
    }),
    updateOrderDetail: builder.mutation<
      void,
      { detail_id: number; status: string }
    >({
      query: ({ detail_id, status }) => ({
        url: `/orders?order_detail_id=${detail_id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
    payOrder: builder.mutation<void, { order_id: number; method: string }>({
      query: ({ order_id, method }) => ({
        url: `/orders/pay?order_id=${order_id}`,
        method: "POST",
        body: { method, total: 0 },
      }),
      invalidatesTags: ["Orders", "Floor"],
    }),
  }),
});

export const {
  useGetActiveOrdersQuery,
  useSyncBulkOrderMutation,
  usePayOrderMutation,
  useUpdateOrderDetailMutation,
} = orderApi;
