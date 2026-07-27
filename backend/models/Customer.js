const mongoose = require('mongoose');
const customerSchema = new mongoose.Schema({

companyName: {type: String, required: true},
contactPersonName: {type: String, required: true},
email: {type: String, required: true, unique: true},
phone: {type: String, required: true},
address: {type: String, required: true},
creditLimit: {type: Number, required: true},
accountStatus: {type: String, enum: ['Active', 'Inactive'], default: 'Active'},
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);