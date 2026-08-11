const mongoose = require('mongoose');
const ticketSchema = new mongoose.Schema({

title: {type: String, required: true},
description: {type: String, required: true},
priority: {type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium'},
linkedOrderId: {type: mongoose.Schema.Types.ObjectId, ref: 'Order'},
assigneeId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
status: {type: String, enum: ['Open', 'In-Progress', 'Resolved', 'Closed'], default: 'Open'},
comments: [
    {
        content: {type: String, required: true},
        userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
        timestamp: { type: Date, default: Date.now }
    }
]
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema);