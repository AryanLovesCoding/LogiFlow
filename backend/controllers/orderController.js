const Inventory = require('../models/Inventory');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

const createOrder = async (req, res) => {
  try {
    const { customerId, warehouseId, orderItems } = req.body;
    for (const item of orderItems) {
      const inventoryRecord = await Inventory.findOne({
        warehouseId: warehouseId,
        productId: item.productId
      });
      if (!inventoryRecord || inventoryRecord.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for product ${item.productId}`
        });
      }
    }
    let totalAmount = 0;
    for (const item of orderItems) {
      totalAmount += item.quantity * item.unitPrice;
    }
    for (const item of orderItems) {
      const inventoryRecord = await Inventory.findOne({
        warehouseId: warehouseId,
        productId: item.productId
      });
      inventoryRecord.quantity -= item.quantity;
      await inventoryRecord.save();
    }
    const newOrder = await Order.create({
      customerId,
      warehouseId,
      orderItems,
      totalAmount,
      status: 'Draft'
    });
    res.status(201).json({
      message: 'Order successfully created',
      order: newOrder
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { status, customerId, page, limit } = req.query;
    const filter = {};
    if (status) {
    filter.status = status;
    }
    if (customerId) {
      filter.customerId = customerId;
    }
    if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const orders = await Order.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Order.countDocuments(filter);
    res.status(200).json({
    orders,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json({ message: 'Order found', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
    const statusFlow = ['Draft', 'Confirmed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const currentIndex = statusFlow.indexOf(order.status);
    const newIndex = statusFlow.indexOf(newStatus);
    if (newIndex === -1) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const isCancellation = newStatus === 'Cancelled';
    if (isCancellation && (order.status === 'Delivered' || order.status === 'Cancelled')) {
      return res.status(400).json({
        message: `Cannot cancel an order that is already '${order.status}'`
      });
    }
    if (!isCancellation && newIndex <= currentIndex) {
      return res.status(400).json({
        message: `Cannot move status from '${order.status}' to '${newStatus}'`
      });
    }
    if (isCancellation) {
      for (const item of order.orderItems) {
        const inventoryRecord = await Inventory.findOne({
          warehouseId: order.warehouseId,
          productId: item.productId
        });
        if (inventoryRecord) {
          inventoryRecord.quantity += item.quantity;
          await inventoryRecord.save();
        }
      }
    }
    order.status = newStatus;
    await order.save();
    await ActivityLog.create({
      userId: req.user.userId,
      action: 'Update',
      entity: 'Order',
      entityId: order._id
    });
    res.status(200).json({
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getOrders, getOrderById, updateStatus };


