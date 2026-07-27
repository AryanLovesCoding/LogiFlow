const mongoose = require('mongoose');
const shipmentSchema = new mongoose.Schema({

orderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true},
originWarehouseId: {type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true},
destinationAddress: {type: String, required: true},
trackingId: {type: String, required: true, unique: true},
status: {type: String, enum: ['Created', 'Assigned', 'In-Transit', 'Out-for-Delivery', 'Delivered', 'Failed'], default: 'Created'},
trackingHistory: [
  {
    location: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }
]
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);