const mongoose = require('mongoose');
const warehouseSchema = new mongoose.Schema({

name: {type: String, required: true},
location: {type: String},
city: {type: String, required: true},
totalCapacity: {type: Number, required: true},
status: {type: String, enum: ['Active', 'Inactive'], default: 'Active'},
managerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, { timestamps: true });

module.exports = mongoose.model('Warehouse', warehouseSchema);