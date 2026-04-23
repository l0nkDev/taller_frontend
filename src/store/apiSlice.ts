// src/store/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:8000/api/v1',
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => {
        const formData = new FormData();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        return {
          url: '/auth/login',
          method: 'POST',
          body: formData,
        };
      },
    }),
  }),
});

export const { useLoginMutation } = apiSlice;