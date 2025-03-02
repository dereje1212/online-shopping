import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router";
import { addToCart } from "../slices/cartSlice";
import {
  useGetAllProductsQuery,
  useAddNewProductMutation,
  useDeleteProductMutation,
} from "../slices/productsApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";

const Home = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [visibleProductId, setVisibleProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "",
    desc: "",
    price: "",
    image: null, // For file input
    imageUrl: "", // For displaying the existing image URL
    category: "",
  });
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // RTK Query hooks
  const { data: products, error, isLoading, refetch } = useGetAllProductsQuery();
  const [addNewProduct] = useAddNewProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  // Add to cart handler
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
    history.push("/cart");
  };

  // Add or update product handler
  const handleAddNewProduct = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newProduct.name || !newProduct.desc || !newProduct.price || !newProduct.category) {
      toast.error("All fields are required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newProduct.name);
      formData.append("desc", newProduct.desc);
      formData.append("price", newProduct.price);
      formData.append("category", newProduct.category);

      // Include the product ID when editing
      if (isEditing) {
        formData.append("id", newProduct.id); // Ensure the ID is included
      }

      // Append the image file if it exists
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      } else if (isEditing && newProduct.imageUrl) {
        // If editing and no new image is uploaded, retain the existing image URL
        formData.append("imageUrl", newProduct.imageUrl);
      }

      const response = await addNewProduct(formData).unwrap();
      toast.success(isEditing ? "Product updated successfully!" : "Product added successfully!");

      // Reset the form and refetch products
      setNewProduct({
        name: "",
        desc: "",
        price: "",
        image: null,
        imageUrl: "",
        category: "",
      });
      setShowAddProductForm(false);

      // Refetch products to ensure the frontend has the latest data
      await refetch();
    } catch (error) {
      toast.error("Failed to save product: " + error.message);
    }
  };

  // Delete product handler
  const handleDeleteProduct = async () => {
    if (!newProduct.id) {
      toast.error("No product selected for deletion.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(newProduct.id).unwrap();
        toast.success("Product deleted successfully!");
        setNewProduct({
          name: "",
          desc: "",
          price: "",
          image: null,
          imageUrl: "",
          category: "",
        });
        setShowAddProductForm(false);
        refetch();
      } catch (error) {
        toast.error("Failed to delete product: " + error.message);
      }
    }
  };

  // Edit product handler
  const handleEditProduct = (product) => {
    console.log("Editing Product:", product); // Log the product being edited
    setNewProduct({
      ...product,
      imageUrl: product.image, // Set the existing image URL
      image: null, // Reset the file input
    });
    setIsEditing(true);
    setShowAddProductForm(true);
  };

  // Group products by category
  const productsByCategory = products?.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

  // Filter products based on search query
  const filteredProducts = products?.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle product details visibility
  const toggleDetails = (productId) => {
    setVisibleProductId((prevId) => (prevId === productId ? null : productId));
  };

  // Function to construct the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "path/to/fallback/image.jpg"; // Fallback image

    // If the imagePath is already a full URL (starts with "http"), return it as-is
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Otherwise, prepend the backend URL for dynamically uploaded images
    return `http://localhost:5000${imagePath}`;
  };

  return (
    <div className="home-container">
      {/* Header Section */}
      <div className="header-section">
        {showAddProductForm && <h3>{isEditing ? "Edit Product" : "Add New Product"}</h3>}
        {!showAddProductForm && <h2>New Arrivals</h2>}
        <button
          className="add-product-button"
          onClick={() => {
            setShowAddProductForm(!showAddProductForm);
            setIsEditing(false);
            setNewProduct({
              name: "",
              desc: "",
              price: "",
              image: null,
              imageUrl: "",
              category: "",
            });
          }}
        >
          {showAddProductForm ? "Hide Form" : "Add New Product"}
        </button>
      </div>

      {/* Search Bar */}
      {!showAddProductForm && (
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showAddProductForm && (
        <form onSubmit={handleAddNewProduct} className="add-product-form" encType="multipart/form-data">
          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={newProduct.desc}
            onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
            required
          />
          {/* Display existing image */}
          {newProduct.imageUrl && (
            <div>
              <img
                src={getImageUrl(newProduct.imageUrl)}
                alt="Current Product"
                style={{ width: "100px", height: "100px", marginBottom: "10px" }}
              />
            </div>
          )}
          {/* File input for new image */}
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setNewProduct({ ...newProduct, image: e.target.files[0] });
              }
            }}
            required={!isEditing} // Only require the file if it's a new product
          />
          <input
            type="text"
            placeholder="Category"
            value={newProduct.category}
            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
            required
          />
          <button type="submit">{isEditing ? "Update Product" : "Add Product"}</button>
          {isEditing && (
            <button type="button" onClick={handleDeleteProduct} className="delete-button">
              Delete Product
            </button>
          )}
        </form>
      )}

      {/* Product List */}
      {!showAddProductForm && (
        <>
          {isLoading ? (
            <div className="loading-spinner">Loading...</div>
          ) : error ? (
            <p className="error-message">Error: {error.message}</p>
          ) : (
            <>
              {searchQuery ? (
                <div className="products-grid">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card">
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="product-image"
                      />
                      <div className="product-details">
                        <h3 className="product-name">{product.name}</h3>
                        <div className="buttons-container">
                          <button
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add To Cart
                          </button>
                          <button
                            className="view-details-btn"
                            onClick={() => toggleDetails(product.id)}
                          >
                            {visibleProductId === product.id ? "Hide Details" : "View Details"}
                          </button>
                          <button
                            className="edit-product-btn"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </button>
                        </div>
                        {visibleProductId === product.id && (
                          <>
                            <p className="product-desc">{product.desc}</p>
                            <p className="product-price">${product.price}</p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                Object.entries(productsByCategory || {}).map(([category, products]) => (
                  <div key={category} className="category-section">
                    <h3 className="category-title">{category}</h3>
                    <div className="products-grid">
                      {products.map((product) => (
                        <div key={product.id} className="product-card">
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="product-image"
                          />
                          <div className="product-details">
                            <h3 className="product-name">{product.name}</h3>
                            <div className="buttons-container">
                              <button
                                className="add-to-cart-btn"
                                onClick={() => handleAddToCart(product)}
                              >
                                Add To Cart
                              </button>
                              <button
                                className="view-details-btn"
                                onClick={() => toggleDetails(product.id)}
                              >
                                {visibleProductId === product.id ? "Hide Details" : "View Details"}
                              </button>
                              <button
                                className="edit-product-btn"
                                onClick={() => handleEditProduct(product)}
                              >
                                Edit
                              </button>
                            </div>
                            {visibleProductId === product.id && (
                              <>
                                <p className="product-desc">{product.desc}</p>
                                <p className="product-price">${product.price}</p>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Home;