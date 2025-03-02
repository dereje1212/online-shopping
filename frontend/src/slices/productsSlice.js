import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

// Async thunk for fetching products
export const productsFetch = createAsyncThunk(
  "products/productsFetch",
  async () => {
    try {
      const response = await axios.get("http://localhost:5000/products");
      return response.data;
    } catch (error) {
      console.log(error);
      throw error; // Ensure the error is thrown so that the rejected action is dispatched
    }
  }
);

// Async thunk for adding a new product
export const addNewProduct = createAsyncThunk(
  "products/addNewProduct",
  async (newProduct, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/products", newProduct);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handling productsFetch
      .addCase(productsFetch.pending, (state) => {
        state.status = "loading";
      })
      .addCase(productsFetch.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(productsFetch.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Handling addNewProduct
      .addCase(addNewProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items.push(action.payload);
      })
      .addCase(addNewProduct.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;