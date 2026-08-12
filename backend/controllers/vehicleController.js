const Vehicle = require('../models/Vehicle');

const createVehicle = async (req, res) => {
  try {
    const {licensePlate, type, capacityKg, status} = req.body;
    const newVehicle = await Vehicle.create({licensePlate, type, capacityKg, status});
    res.status(201).json({
    message: 'Vehicle successfully created',
    vehicle: {
        licensePlate: newVehicle.licensePlate,
        type: newVehicle.type,
        capacityKg: newVehicle.capacityKg,
        status: newVehicle.status,
        _id: newVehicle._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVehicles = async (req, res) => {
  try {
    const { status, type, page, limit } = req.query;
    const filter = {};
    if (status) {
    filter.status = status;
    }
    if (type) {
    filter.type = type;
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const vehicles = await Vehicle.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Vehicle.countDocuments(filter);
    res.status(200).json({
    vehicles,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getVehicleByAvailable = async (req, res) => {
  try {
    const vehicle = await Vehicle.find({ status: 'Available' });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json({ message: 'Vehicle found', vehicle });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedVehicle) {
    return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        vehicle: updatedVehicle
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
    try{
        const deletedVehicle = await Vehicle.findByIdAndUpdate(
        req.params.id,
        { status: 'Maintenance' },
        { new : true}
        );
        if (!deletedVehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.status(200).json({
            message: 'Deleted successfully',
            vehicle: deletedVehicle
        })
    }
    catch(error){
    res.status(500).json({ message: error.message });
    }
};

module.exports = { createVehicle, getVehicles, getVehicleByAvailable, updateVehicle, deleteVehicle };


