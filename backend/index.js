require("dotenv").config({ path: "../.env" }); // Load environment variables from the root folde


const express = require("express");
const cors = require("cors");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

// Debugging: Log Cloudinary configuration
console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL);

// Configure Cloudinary using the CLOUDINARY_URL environment variable
cloudinary.config();

const products = require("./products"); // Array to store products
const app = express();

// Set up multer (store files in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000" })); // Allow frontend access

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to our online shop API...");
});

// Get all products
app.get("/products", (req, res) => {
  res.status(200).json(products);
});

// Upload image to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "online-shop" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        console.log("Cloudinary upload result:", result);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};
// app.put("/products/:id", upload.single("image"), async (req, res) => {
//   const productId = parseInt(req.params.id);
//   const { name, price, desc, category, imageUrl } = req.body;

//   // Find the product
//   const productIndex = products.findIndex((p) => p.id === productId);
//   if (productIndex === -1) {
//     return res.status(404).json({ message: "Product not found" });
//   }

//   let updatedImageUrl = imageUrl || products[productIndex].image; // Use existing image if not changed

//   // If a new file is uploaded, upload to Cloudinary
//   if (req.file && req.file.buffer) {
//     try {
//       updatedImageUrl = await uploadToCloudinary(req.file.buffer);
//     } catch (error) {
//       return res.status(500).json({ message: "Image upload failed", error: error.message });
//     }
//   }

//   // Update the product
//   const updatedProduct = {
//     ...products[productIndex],
//     name: name || products[productIndex].name,
//     price: price ? parseFloat(price) : products[productIndex].price,
//     desc: desc || products[productIndex].desc,
//     category: category || products[productIndex].category,
//     image: updatedImageUrl,
//   };

//   products[productIndex] = updatedProduct;
//   res.status(200).json(updatedProduct);
// });

// Add a new product
app.post("/products", upload.single("image"), async (req, res) => {
  console.log("Request Body:", req.body);
  console.log("Uploaded File:", req.file); // Debugging

  const { name, price, desc, category } = req.body;

  // Validate request body
  if (!name || !price || !desc || !category || !req.file) {
    console.error("Missing fields:", { name, price, desc, category, file: req.file });
    return res.status(400).json({ message: "All fields (including image) are required" });
  }

  // Ensure price is a valid number
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return res.status(400).json({ message: "Price must be a valid number greater than 0" });
  }

  try {
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    const newProduct = {
      id: products.length + 1,
      name,
      price: parsedPrice, // Ensure price is a valid number
      desc,
      category,
      image: imageUrl, // Store Cloudinary image URL
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error in /products route:", error);
    res.status(500).json({ message: "Failed to add product", error: error.message });
  }
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
app.put("/products/:id", upload.single("image"), async (req, res) => {
  const productId = parseInt(req.params.id);
  const { name, price, desc, category } = req.body;

  // Find product
  const productIndex = products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  try {
    let imageUrl = products[productIndex].image; // Keep existing image

    // If a new image is uploaded, update it on Cloudinary
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    // Update product data
    const updatedProduct = {
      ...products[productIndex],
      name: name || products[productIndex].name,
      price: price ? parseFloat(price) : products[productIndex].price,
      desc: desc || products[productIndex].desc,
      category: category || products[productIndex].category,
      image: imageUrl, // Updated image or existing one
    };

    products[productIndex] = updatedProduct;
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
});


// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));