import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints
export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://service-6kef.onrender.com" }),
  endpoints: (builder) => ({
    // Query to get all products
    getAllProducts: builder.query({
      query: () => `products`,
    }),
    // Mutation to add a new product
    addNewProduct: builder.mutation({
      query: (newProduct) => ({
        url: "products",
        method: "POST",
        body: newProduct,
      }),
    }),
    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `products/${productId}`,
        method: "DELETE",
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const { useGetAllProductsQuery, useAddNewProductMutation, useDeleteProductMutation } = productsApi;
