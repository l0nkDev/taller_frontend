import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
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

export const { useLoginMutation } = authApi;