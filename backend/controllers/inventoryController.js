const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');
const triggerLowStockNotification = require('../utils/notificationUtils');

const createInventory = async (req, res) => {
  try {
    const {warehouseId, productId, quantity, reorderThreshold, unit} = req.body;
    const newInventory = await Inventory.create({warehouseId, productId, quantity, reorderThreshold, unit});
    res.status(201).json({
    message: 'Inventory successfully created',
    inventory: {
        warehouseId: newInventory.warehouseId,
        productId: newInventory.productId,
        quantity: newInventory.quantity,
        reorderThreshold: newInventory.reorderThreshold,
        unit: newInventory.unit,
        _id: newInventory._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.status(200).json({ message: 'Inventory found', inventory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInventory = async (req, res) => {
  try {
    const { warehouseId, productId, lowStockAlert, page, limit } = req.query;
    const filter = {};
    if (warehouseId) {
    filter.warehouseId = warehouseId;
    }
    if (productId) {
    filter.productId = productId;
    }
    if (lowStockAlert) {
    filter.lowStockAlert = lowStockAlert === 'true';
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const inventory = await Inventory.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Inventory.countDocuments(filter);
    res.status(200).json({
    inventory,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const restockInventory = async (req, res) => {
  try {
    const { restockAmount } = req.body;
    if (!restockAmount || restockAmount <= 0) {
      return res.status(400).json({ message: 'Restock amount not valid' });
    }
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    inventory.quantity += restockAmount;
    if (inventory.quantity >= inventory.reorderThreshold) {
      inventory.lowStockAlert = false;
    }
    await inventory.save();
    await ActivityLog.create({
      userId: req.user.userId,
      action: 'Update',
      entity: 'Inventory',
      entityId: inventory._id
    });
    res.status(200).json({
      message: 'Inventory restocked successfully',
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deductInventory = async (req, res) => {
  try {
    const { deductionAmount } = req.body;
    if (!deductionAmount || deductionAmount <= 0) {
      return res.status(400).json({ message: 'Deduction amount not valid' });
    }
    const inventory = await Inventory.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    if (inventory.quantity - deductionAmount < 0) {
      return res.status(400).json({ message: 'Insufficient stock for this deduction' });
    }
    inventory.quantity -= deductionAmount;
    if (inventory.quantity < inventory.reorderThreshold) {
      inventory.lowStockAlert = true;
      await triggerLowStockNotification(inventory);
    }
    await inventory.save();
    await ActivityLog.create({
      userId: req.user.userId,
      action: 'Update',
      entity: 'Inventory',
      entityId: inventory._id
    });
    res.status(200).json({
      message: 'Inventory deducted successfully',
      inventory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInventoryByLowStock = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const inventory = await Inventory.find({ lowStockAlert: true }).skip(skip).limit(pageLimit);
    const totalCount = await Inventory.countDocuments({ lowStockAlert: true });
    res.status(200).json({
      inventory,
      totalCount,
      currentPage,
      totalPages: Math.ceil(totalCount / pageLimit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {createInventory, getInventoryById, getInventory, restockInventory, deductInventory, getInventoryByLowStock}

