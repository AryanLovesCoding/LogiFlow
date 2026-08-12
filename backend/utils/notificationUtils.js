const Notification = require('../models/Notification');
const Warehouse = require('../models/Warehouse');

const triggerLowStockNotification = async (inventory) => {
  const warehouse = await Warehouse.findById(inventory.warehouseId);
  if (warehouse && warehouse.managerId) {
    await Notification.create({
      receiverId: warehouse.managerId,
      content: `Low stock alert: product ${inventory.productId} in warehouse ${inventory.warehouseId} has fallen below the reorder threshold.`,
      type: 'low-stock'
    });
  }
};

module.exports = triggerLowStockNotification;