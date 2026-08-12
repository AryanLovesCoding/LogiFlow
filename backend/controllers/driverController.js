const Driver = require('../models/Driver');

const createDriver = async (req, res) => {
  try {
    const {name,licenceNumber, phone, assignedVehicleId, available} = req.body;
    const newDriver = await Driver.create({name,licenceNumber, phone, assignedVehicleId, available} );
    res.status(201).json({
    message: 'Driver successfully created',
    driver: {
        name: newDriver.name,
        licenceNumber: newDriver.licenceNumber,
        phone: newDriver.phone,
        assignedVehicleId: newDriver.assignedVehicleId,
        available: newDriver.available,
        _id: newDriver._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDrivers = async (req, res) => {
  try {
    const { available, page, limit } = req.query;
    const filter = {};
    if (available !== undefined) {
    filter.available = available === 'true';
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const drivers = await Driver.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Driver.countDocuments(filter);
    res.status(200).json({
    drivers,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const updatedAvailability = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedAvailability) {
    return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        driver: updatedAvailability
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDriver = async (req, res) => {
    try{
        const deletedDriver = await Driver.findByIdAndUpdate(
        req.params.id,
        { available: false },
        { new : true}
        );
        if (!deletedDriver) {
        return res.status(404).json({ message: 'Driver not found' });
        }
        res.status(200).json({
            message: 'Deleted successfully',
            driver: deletedDriver
        })
    }
    catch(error){
    res.status(500).json({ message: error.message });
    }
};

module.exports = { createDriver, getDrivers, updateAvailability, deleteDriver };


