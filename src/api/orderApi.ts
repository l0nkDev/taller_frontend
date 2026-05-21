import { baseApi } from "./baseApi";

// ==========================================
// INTERFACES (Espejo de tus schemas de Python)
// ==========================================
export interface OrderDetailRead {
  id: number;
  dish_id: number;
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
    
    // Obtiene todas las órdenes vivas en el restaurante
    getActiveOrders: builder.query<OrderRead[], void>({
      query: () => "/orders/active",
      providesTags: ["Orders"],
    }),

    // Sincroniza el carrito completo con la base de datos
    syncBulkOrder: builder.mutation<OrderRead, OrderBulkSync>({
      query: (body) => ({
        url: `/orders/bulk-sync`,
        method: "POST",
        body,
      }),
      // Invalidar "Orders" fuerza a todas las pantallas a pedir los datos frescos 
      // y repintar sus mesas de rojo instantáneamente.
      invalidatesTags: ["Orders"], 
    }),

  }),
});

export const { 
  useGetActiveOrdersQuery, 
  useSyncBulkOrderMutation 
} = orderApi;