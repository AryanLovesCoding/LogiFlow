const mongoose = require('mongoose');
const vehicleSchema = new mongoose.Schema({

licensePlate: {type: String, required: true, unique: true},
type: {type: String, required: true},
capacityKg: {type: Number, required: true},
status: {type: String, enum: ['Available', 'In-Use', 'Maintenance'], default: 'Available'},
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);