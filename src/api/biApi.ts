import { baseApi } from "./baseApi";

export interface SalesHistoryItem {
  order_id: number;
  created_at: string;
  total: number;
  method: "C" | "Q";
  dish_names: string[];
}

export interface PaginatedSalesHistory {
  items: SalesHistoryItem[];
  total_pages: number;
  current_page: number;
  total_items: number;
}

export interface SalesHistoryQueryArgs {
  start_date?: string;
  end_date?: string;
  dish_name?: string;
  category_id?: number;
  page?: number;
  page_size?: number;
}

export interface TopDish {
  name: string;
  quantity: number;
}

export interface PopularFloor {
  name: string;
  orders: number;
  revenue: number;
}

export interface SalesPerDay {
  date: string;
  revenue: number;
}

export interface SalesPerWeek {
  week: string;
  revenue: number;
}

export interface SalesPerMonth {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  top_dishes: TopDish[];
  popular_floors: PopularFloor[];
  sales_per_day: SalesPerDay[];
  sales_per_week: SalesPerWeek[];
  sales_per_month: SalesPerMonth[];
}

export interface Projection {
  date: string;
  expected_revenue: number;
}

export interface ProjectionResponse {
  success: boolean;
  message: string;
  projections: Projection[];
}

export const biApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesHistory: builder.query<PaginatedSalesHistory, SalesHistoryQueryArgs>({
      query: (params) => {
        let url = "/bi/sales-history";
        const searchParams = new URLSearchParams();
        if (params.start_date) searchParams.append("start_date", params.start_date);
        if (params.end_date) searchParams.append("end_date", params.end_date);
        if (params.dish_name) searchParams.append("dish_name", params.dish_name);
        if (params.category_id !== undefined) searchParams.append("category_id", params.category_id.toString());
        if (params.page !== undefined) searchParams.append("page", params.page.toString());
        if (params.page_size !== undefined) searchParams.append("page_size", params.page_size.toString());
        
        if (searchParams.toString()) url += `?${searchParams.toString()}`;
        return url;
      },
      providesTags: ["BI" as any],
    }),
    getDashboardStats: builder.query<DashboardStats, { start_date?: string; end_date?: string } | void>({
      query: (params) => {
        let url = "/bi/dashboard-stats";
        if (params) {
          const searchParams = new URLSearchParams();
          if (params.start_date) searchParams.append("start_date", params.start_date);
          if (params.end_date) searchParams.append("end_date", params.end_date);
          if (searchParams.toString()) url += `?${searchParams.toString()}`;
        }
        return url;
      },
      providesTags: ["BI" as any],
    }),
    getProjections: builder.query<ProjectionResponse, string | void>({
      query: (timeframe) => {
        let url = "/bi/projections";
        if (timeframe) {
          url += `?timeframe=${timeframe}`;
        }
        return url;
      },
      providesTags: ["BI" as any],
    }),
  }),
});

export const { useGetSalesHistoryQuery, useGetDashboardStatsQuery, useGetProjectionsQuery } = biApi;
