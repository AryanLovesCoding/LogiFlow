const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({

name: {type: String, required: true},
sku: {type: String, required: true, unique: true},
category: {type: String, required: true},
unit: {type: String, required: true},
description: {type: String},
status: {type: String, enum: ['Active', 'Inactive'], default: 'Active'},
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);