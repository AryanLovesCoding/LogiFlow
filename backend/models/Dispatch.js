const mongoose = require('mongoose');
const dispatchSchema = new mongoose.Schema({

shipmentId: {type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true},
vehicleId: {type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true},
driverId: {type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true},
scheduledDate: {type: Date, required: true},
routeNotes: {type: String},
}, { timestamps: true });

module.exports = mongoose.model('Dispatch', dispatchSchema);