const mongoose = require('mongoose');
const driverSchema = new mongoose.Schema({

name: {type: String, required: true},
licenceNumber: {type: String, required: true, unique: true},
phone: {type: String, required: true},
available: {type: Boolean, default: true},
assignedVehicleId: {type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle'},
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);