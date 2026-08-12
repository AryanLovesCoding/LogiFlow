const Order = require('../models/Order');
const Shipment = require('../models/Shipment');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');
const Dispatch = require('../models/Dispatch');
const Product = require('../models/Product');

const getSummary = async (req, res) => {
  try {
    const totalActiveOrders = await Order.countDocuments({status: { $nin: ['Delivered', 'Cancelled'] }});
    const allShipments = await Shipment.find();
    const shipmentStatusCounts = {};
    for (const shipment of allShipments) {
      if (!shipmentStatusCounts[shipment.status]) {
        shipmentStatusCounts[shipment.status] = 0;
      }
      shipmentStatusCounts[shipment.status] += 1;
    }
    const shipmentsByStatus = [];
    for (const status in shipmentStatusCounts) {
      shipmentsByStatus.push({ status: status, count: shipmentStatusCounts[status] });
    }
    const warehouses = await Warehouse.find();
    const warehouseUtilisation = [];
    for (const warehouse of warehouses) {
      const inventoryItems = await Inventory.find({ warehouseId: warehouse._id });
      let usedQuantity = 0;
      for (const item of inventoryItems) {
        usedQuantity = usedQuantity + item.quantity;
      }
      const usedCapacityPercent = warehouse.totalCapacity > 0
        ? Number(((usedQuantity / warehouse.totalCapacity) * 100).toFixed(2))
        : 0;
      warehouseUtilisation.push({warehouseId: warehouse._id, usedCapacityPercent: usedCapacityPercent});
    }
    const allOrders = await Order.find();
    const productQuantities = {};
    for (const order of allOrders) {
      for (const item of order.orderItems) {
        const productIdString = item.productId.toString();
        if (!productQuantities[productIdString]) {
          productQuantities[productIdString] = 0;
        }
        productQuantities[productIdString] = productQuantities[productIdString] + item.quantity;
      }
    }
    let productArray = [];
    for (const productId in productQuantities) {
      productArray.push({ productId: productId, totalQuantity: productQuantities[productId] });
    }
    productArray.sort((a, b) => b.totalQuantity - a.totalQuantity);
    const top5 = productArray.slice(0, 5);
    const topProductsByOrderVolume = [];
    for (const entry of top5) {
      const product = await Product.findById(entry.productId);
      topProductsByOrderVolume.push({
        productId: entry.productId,
        name: product ? product.name : 'Unknown Product',
        totalQuantity: entry.totalQuantity
      });
    }
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentDispatches = await Dispatch.find({ updatedAt: { $gte: sevenDaysAgo } });
    let dispatchesCompletedThisWeek = 0;
    for (const dispatch of recentDispatches) {
      const shipment = await Shipment.findById(dispatch.shipmentId);
      if (shipment && shipment.status === 'Delivered') {
        dispatchesCompletedThisWeek = dispatchesCompletedThisWeek + 1;
      }
    }
    res.status(200).json({
      totalActiveOrders,
      shipmentsByStatus,
      warehouseUtilisation,
      topProductsByOrderVolume,
      dispatchesCompletedThisWeek
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getOrdersByDay = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } });
    const dateCounts = {};
    for (const order of recentOrders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dateCounts[dateKey]) {
        dateCounts[dateKey] = 0;
      }
      dateCounts[dateKey] = dateCounts[dateKey] + 1;
    }
    const ordersByDay = [];
    for (const date in dateCounts) {
      ordersByDay.push({ date: date, count: dateCounts[date] });
    }
    ordersByDay.sort((a, b) => a.date.localeCompare(b.date));
    res.status(200).json({ ordersByDay });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSummary, getOrdersByDay };