const express = require('express');
const Product = require('../models/products.model');
const router = express.Router();
const app = express();

app.use(express.json());

// GET all products
router.get('/', async (req, res) => {
  // Logic to fetch all products from the database
  // Handle any errors that may occur
  try {
    const products = await Product.find().lean().exec();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET a specific product
router.get('/:id', (req, res) => {
  const productId = req.params.id;

  // Logic to fetch a specific product from the database
  // Handle any errors that may occur
  try {
    // Fetch the product from the database based on the provided ID
    const product = null; // Replace with actual logic to fetch a product

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Send the product as a response
    res.status(200).json(product);
  } catch (error) {
    // Handle any errors that occurred during fetching the product
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch the product' });
  }
});

// POST a new product
router.post('/', async (req, res) => {
  const {
    active,
    name,
    description,
    startDate,
    endDate,
    currency,
    paymantUrl,
    sign,
    price,
    priceRial,
    isDiscounted,
    period,
    imageSrc,
    href,
    features,
  } = req.body;

  // Validate required fields
  //   if (
  //     !active ||
  //     !name ||
  //     !description ||
  //     !startDate ||
  //     !endDate ||
  //     !currency ||
  //     !paymantUrl ||
  //     !sign ||
  //     !price ||
  //     !priceRial ||
  //     !isDiscounted ||
  //     //!period ||
  //     !imageSrc ||
  //     //!href ||
  //     !features
  //   ) {
  //     return res.status(400).json({ error: 'Missing required fields' });
  //   }

  try {
    // Create a new product in the database
    const newProduct = new Product({
      active,
      name,
      description,
      startDate,
      endDate,
      currency,
      paymantUrl,
      sign,
      price,
      priceRial,
      isDiscounted,
      period,
      imageSrc,
      href,
      features,
    });

    // Save the new product
    const result = await newProduct.save();

    res.json({
      status: 'Exercise has been added to the Database',
      data: result,
    });
  } catch (error) {
    // Handle any errors that occurred during creating the product
    console.error(error);
    res.status(500).json({ error: 'Failed to create the product' });
  }
});

// PUT update a product
router.put('/:id', (req, res) => {
  const productId = req.params.id;
  const { name, price } = req.body;

  // Validate the request body
  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  // Logic to update a product in the database
  // Handle any errors that may occur
  try {
    // Update the product in the database based on the provided ID
    const updatedProduct = null; // Replace with actual logic to update a product

    // Check if the product exists
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Send the updated product as a response
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Handle any errors that occurred during updating the product
    console.error(error);
    res.status(500).json({ error: 'Failed to update the product' });
  }
});

// DELETE a product
router.delete('/:id', (req, res) => {
  const productId = req.params.id;

  // Logic to delete a product from the database
  // Handle any errors that may occur
  try {
    // Delete the product from the database based on the provided ID
    const deletedProduct = null; // Replace with actual logic to delete a product

    // Check if the product exists
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Send a success message as a response
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    // Handle any errors that occurred during deleting the product
    console.error(error);
    res.status(500).json({ error: 'Failed to delete the product' });
  }
});

module.exports = router;
