const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({

orderItems: [
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
  }
],
customerId: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true},
warehouseId: {type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true},
totalAmount: {type: Number, default: 0},
status: {type: String, enum: ['Draft', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'], default: 'Draft'},
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);