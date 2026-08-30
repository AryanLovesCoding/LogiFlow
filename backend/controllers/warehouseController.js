const Warehouse = require('../models/Warehouse');

const createWarehouse = async (req, res) => {
  try {
    const {name, location, city, totalCapacity, managerId, status} = req.body;
    const newWarehouse = await Warehouse.create({name, location, city, totalCapacity, managerId, status});
    res.status(201).json({
    message: 'Warehouse successfully created',
    warehouse: {
        name: newWarehouse.name,
        location: newWarehouse.location,
        city: newWarehouse.city,
        totalCapacity: newWarehouse.totalCapacity,
        managerId: newWarehouse.managerId,
        status: newWarehouse.status,
        _id: newWarehouse._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWarehouses = async (req, res) => {
  try {
    const { city, status, page, limit } = req.query;
    const filter = {};
    if (city) {
    filter.city = { $regex: city, $options: 'i' };
    }
    if (status) {
    filter.status = status;
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const warehouses = await Warehouse.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Warehouse.countDocuments(filter);
    res.status(200).json({
    warehouses,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getWarehouseById = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.status(200).json({ message: 'Warehouse found', warehouse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWarehouse = async (req, res) => {
  try {
    const updatedWarehouse = await Warehouse.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedWarehouse) {
    return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        warehouse: updatedWarehouse
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWarehouse = async (req, res) => {
    try{
        const deletedWarehouse = await Warehouse.findByIdAndUpdate(
        req.params.id,
        { status: 'Inactive' },
        { new : true}
        );
        if (!deletedWarehouse) {
        return res.status(404).json({ message: 'Warehouse not found' });
        }
        res.status(200).json({
            message: 'Deleted successfully',
            warehouse: deletedWarehouse
        })
    }
    catch(error){
    res.status(500).json({ message: error.message });
    }
};

module.exports = { createWarehouse, getWarehouses, getWarehouseById, updateWarehouse, deleteWarehouse };


