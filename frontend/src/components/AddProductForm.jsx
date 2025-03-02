import React, { useState } from "react";
import { useAddNewProductMutation } from "../slices/productsApi";

const AddProductForm = () => {
  const [addNewProduct, { isLoading, isError, error }] = useAddNewProductMutation();
  const [productName, setProductName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addNewProduct({ name: productName }).unwrap();
      alert("Product added successfully!");
      setProductName("");
    } catch (err) {
      console.error("Failed to add product:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        placeholder="Enter product name"
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Product"}
      </button>
      {isError && <p>Error: {error.message}</p>}
    </form>
  );
};

export default AddProductForm;