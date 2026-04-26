// src/features/users/usersApi.ts
import { baseApi } from './baseApi';


export interface Dish {
  id: number,
  name: string,
  description: string,
  category_id: number;
  price: number;
  available: boolean;
  category_name: string;
}

export interface Category {
    id: number,
    name: string, 
    dishes: Dish[]
}

export const dishesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDishes: builder.query<Dish[], void>({
      query: () => '/dishes',
      providesTags: ['Dish'],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => '/categories',
      providesTags: ['Dish'],
    }),
    createDish: builder.mutation<Dish, Partial<Dish>>({
      query: (body) => ({
        url: '/dishes',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dish'], 
    }),
    updateDish: builder.mutation<Dish, {id: number, body: Partial<Dish>}>({
      query: ({id, body}) => ({
        url: `/dishes/?dish_id=${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Dish'], 
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dish'], 
    }),
    updateCategory: builder.mutation<Category, {id: number, body: Partial<Category>}>({
      query: ({id, body}) => ({
        url: `/categories/?category_id=${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Dish'], 
    }),
  }),
  overrideExisting: false,
});

export const { useGetDishesQuery, useGetCategoriesQuery, useCreateDishMutation, useUpdateDishMutation } = dishesApi;