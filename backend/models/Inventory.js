const mongoose = require('mongoose');
const inventorySchema = new mongoose.Schema({

warehouseId: {type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true},
productId: {type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true},
quantity: {type: Number, required: true, default: 0, min: 0},
reorderThreshold: {type: Number, required: true},
unit: {type: String, required: true},
lowStockAlert: {type: Boolean, default: false},
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);