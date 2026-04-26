// src/features/users/usersApi.ts
import { baseApi } from './baseApi';

export interface User {
    id: number,
    username: string, 
    fname: string, 
    lname: string, 
    phone: string,
    role: string,
    is_active: boolean
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      providesTags: ['User'],
    }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'], 
    }),
    updateUser: builder.mutation<User, {id: number, body: Partial<User>}>({
      query: ({id, body}) => ({
        url: `/users/?user_id=${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['User'], 
    }),
    deleteUser: builder.mutation<User, number>({
      query: (userId) => ({
        url: `/users/?user_id=${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'], 
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery, useCreateUserMutation } = usersApi;