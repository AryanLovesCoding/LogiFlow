const ActivityLog = require('../models/ActivityLog');

const getLogs = async (req, res) => {
  try {
    const { entity, userId, startDate, endDate, page, limit } = req.query;
    const filter = {};
    if (entity) {
    filter.entity = entity;
    }
    if (userId) {
      filter.userId = userId;
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const logs = await ActivityLog.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await ActivityLog.countDocuments(filter);
    res.status(200).json({
    logs,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLogs };