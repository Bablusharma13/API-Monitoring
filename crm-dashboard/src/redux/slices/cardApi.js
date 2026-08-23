import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
    reducerPath: "cardApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BILLING_BACKEND}/api/v1`,
        credentials: "include",
    }),
    tagTypes: ["cards"],

    endpoints: (builder) => ({
        cards: builder.query({
            query: (params = {}) => {
              const searchParams = new URLSearchParams();
          
              Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                  searchParams.set(key, String(value));
                }
              });
          
              return `/card?${searchParams.toString()}`;
            },
            providesTags: ["cards"],
          }),
        makeCardPrimary: builder.mutation({
            query: ({slug, userId}) => ({
                url: `/card?slug=${slug}&userId=${userId}`,
                method: 'PATCH',
            }),
            invalidatesTags: ["cards"],
        }),
        deleteCard: builder.mutation({
            query: ({slug,userId}) => ({
                url: `/card?slug=${slug}&userId=${userId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ["cards"],
        }),
        createCard: builder.mutation({
            query: ({cardData,userId}) => (
                {
                url: `/card/new?userId=${userId}`,
                method: 'POST',
                body: cardData,
            }),
            invalidatesTags: ["cards"],
        }),

    }),
});


export const {
    useCardsQuery,
    useMakeCardPrimaryMutation,
    useDeleteCardMutation,
    useCreateCardMutation
    
} = api;

export default api;
