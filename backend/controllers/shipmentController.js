const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const crypto = require('crypto');

const createShipment = async (req, res) => {
  try {
    const { orderId, destinationAddress } = req.body;
    const order = await Order.findById(orderId)
    if (!order) {
        return res.status(404).json({ message: 'Order does not exist' });
    }
    if  ( order.status !== 'Confirmed') {
        return res.status(400).json({ message: 'Only a confirmed order can be shipped' });
    }
    const trackingId = crypto.randomUUID();
    const newShipment = await Shipment.create({
    orderId: order._id,
    originWarehouseId: order.warehouseId,
    destinationAddress,
    trackingId,
    status: 'Created'
    });
    res.status(201).json({
    message: 'Shipment successfully created',
    shipment: newShipment
});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getShipments = async (req, res) => {
  try {
    const { status, warehouseId, page, limit } = req.query;
    const filter = {};
    if (status) {
    filter.status = status;
    }
    if (warehouseId) {
      filter.warehouseId = warehouseId;
    }
    if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const shipments = await Shipment.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Shipment.countDocuments(filter);
    res.status(200).json({
    shipments,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    res.status(200).json({ message: 'Shipment found', shipment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateShipment = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const statusFlow = ['Created', 'Assigned', 'In-Transit', 'Out-for-Delivery', 'Delivered', 'Failed'];
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }
    const currentIndex = statusFlow.indexOf(shipment.status);
    const newIndex = statusFlow.indexOf(newStatus);
    if (newIndex === -1) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    if (newIndex <= currentIndex) {
      return res.status(400).json({ message: 'Status value not moving forward' });
    }
    const isFailed = newStatus === 'Failed';
    if (isFailed && (shipment.status === 'Delivered' || shipment.status === 'Failed')) {
      return res.status(400).json({
        message: `Cannot fail a shipment that is already '${shipment.status}'`
      });
    }
    shipment.status = newStatus;
    await shipment.save();
    if (newStatus === 'Delivered') {
      const order = await Order.findById(shipment.orderId);
      order.status = 'Delivered';
      await order.save();
    } else if (newStatus === 'Failed') {
      const coordinator = await User.findOne({ role: 'Logistics Coordinator' });
      if (coordinator) {
        await Notification.create({
          receiverId: coordinator._id,
          content: `Shipment ${shipment.trackingId} has failed delivery.`,
          type: 'shipment-failed'
        });
      }
    }
    await ActivityLog.create({
      userId: req.user.userId,
      action: 'Update',
      entity: 'Shipment',
      entityId: shipment._id
    });
    res.status(200).json({
      message: 'Shipment status updated successfully',
      shipment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const trackShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
    }
    const {location, description} = req.body;
    shipment.trackingHistory.push({ location, description })
    await shipment.save(); 
    res.status(200).json({
      message: 'Shipment updated successfully',
      shipment
    });
    } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createShipment, getShipments, getShipmentById, updateShipment, trackShipment };

