const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const products = require("./products"); // Array to store products

const app = express();

// Set up multer to store uploaded images in the 'public/images' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images"); // Folder where images will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // File name with a timestamp
  },
});

const upload = multer({ storage });

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors());
app.use("/images", express.static("public/images")); // Serve images from the public/images directory

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to our online shop API...");
});

// Get all products
app.get("/products", (req, res) => {
  res.status(200).json(products);
});

// Add a new product (including image upload)
app.post("/products", upload.single("image"), (req, res) => {
  const { name, price, desc, category } = req.body;

  // Validate required fields
  if (!name || !price || !desc || !category || !req.file) {
    return res.status(400).json({ message: "All fields (including image) are required" });
  }

  // Create a new product object with the uploaded image path
  const newProduct = {
    id: products.length + 1,
    name,
    price: parseFloat(price),
    desc,
    category,
    image: `/images/${req.file.filename}`, // Store the path to the uploaded image
  };

  products.push(newProduct); // Add the new product to the array
  res.status(201).json(newProduct); // Send back the newly added product
});

// Edit a product by ID
app.put("/products/:id", upload.single("image"), (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, desc, category, imageUrl } = req.body;

  // Find the product to edit
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Update the product
  const updatedProduct = {
    ...products[productIndex],
    name: name || products[productIndex].name,
    price: price ? parseFloat(price) : products[productIndex].price,
    desc: desc || products[productIndex].desc,
    category: category || products[productIndex].category,
    image: req.file ? `/images/${req.file.filename}` : imageUrl || products[productIndex].image, // Use new image if uploaded, otherwise retain existing image
  };

  products[productIndex] = updatedProduct; // Replace the old product with the updated one
  res.status(200).json(updatedProduct); // Send back the updated product
});

// Delete a product by ID
app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  products.splice(productIndex, 1); // Remove the product
  res.status(200).json({ message: "Product deleted successfully" });
});

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));