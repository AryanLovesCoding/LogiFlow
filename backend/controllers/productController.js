const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const {name, sku, category, unit, description, status} = req.body;
    const newProduct = await Product.create({name, sku, category, unit, description, status});
    res.status(201).json({
    message: 'Product successfully created',
    product: {
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category,
        unit: newProduct.unit,
        description: newProduct.description,
        status: newProduct.status,
        _id: newProduct._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { name, sku, category, page, limit } = req.query;
    const filter = {};
    if (name) {
    filter.name = { $regex: name, $options: 'i' };
    }
    if (sku) {
    filter.sku = { $regex: sku, $options: 'i' };
    }
    if (category) {
    filter.category = { $regex: category, $options: 'i' };
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const products = await Product.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Product.countDocuments(filter);
    res.status(200).json({
        products,
        totalCount,
        currentPage,
        totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product found', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
    return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        product: updatedProduct
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
    try{
        const deletedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { status: 'Inactive' },
        { new : true}
        );
        if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({
            message: 'Deleted successfully',
            product: deletedProduct
        })
    }
    catch(error){
    res.status(500).json({ message: error.message });
    }
};

module.exports = { createProduct, getProducts, getProductById, updateProduct, deleteProduct};


