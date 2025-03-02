import { configureStore } from "@reduxjs/toolkit";
import { productsApi } from "../slices/productsApi";
import cartReducer from "../slices/cartSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [productsApi.reducerPath]: productsApi.reducer, // Add the productsApi reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productsApi.middleware), // Add the productsApi middleware
});