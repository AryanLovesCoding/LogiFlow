const mongoose = require('mongoose');
const activityLogSchema = new mongoose.Schema({

userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},   
action: {type: String, enum: ['Create', 'Update', 'Delete'], required: true},
entity: {type: String, required: true},
entityId: {type: mongoose.Schema.Types.ObjectId},
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);