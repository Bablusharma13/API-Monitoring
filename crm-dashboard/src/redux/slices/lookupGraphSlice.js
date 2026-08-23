import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const LookUpAPI = createApi({
  reducerPath: "lookupApi", 
    baseQuery:fetchBaseQuery({baseUrl:(`${import.meta.env.VITE_BACKEND_URL}`)}),
    tagTypes: ["GraphData"],  
    endpoints:(builder)=>({
     
      lookupeGraphData: builder.query({
        query: (body) => ({
          url: '/lookup',
          method: 'POST',
          body, // Send request body as JSON
        }),
        // invalidatesTags: ['GraphData']
        // invalidatesTags: (result, error, arg) => {
        //   // Safely handle undefined or missing fields
        //   if (arg?.id) {
        //     return [{ type: 'User', id: arg.id }];
        //   }
      
        //   // If no specific ID to invalidate, fallback to a general tag
        //   return [{ type: 'User' }];
        // },
      }),
      
    })
})

export const {useLookupeGraphDataQuery} = LookUpAPI