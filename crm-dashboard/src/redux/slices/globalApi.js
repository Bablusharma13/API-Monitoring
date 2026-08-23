import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const globalApi = createApi({
  reducerPath: "globalApi",
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BILLING_BACKEND }),
  endpoints: (builder) => ({
    getCountries: builder.query({
      query: () => `/api/v1/select-input-options/countries`,
    }),
  }),
});

export const { useGetCountriesQuery } = globalApi;
