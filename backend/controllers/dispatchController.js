const Dispatch = require('../models/Dispatch');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Shipment = require('../models/Shipment');
const Order = require('../models/Order');

const createDispatch = async (req, res) => {
  try {
    const {shipmentId, vehicleId, driverId, scheduledDate, routeNotes} = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    const driver = await Driver.findById(driverId);
    const shipment = await Shipment.findById(shipmentId);
    if (!vehicle) {
        return res.status(404).json({message: 'Vehicle does not exist'});
    }
    if (!driver) {
        return res.status(404).json({message: 'Driver does not exist'});
    }
    if (vehicle.status !== 'Available') {
        return res.status(400).json({message: 'Vehicle not available'});
    }
    if (driver.available !== true) {
        return res.status(400).json({message: 'Driver not available'});
    }
    if (!shipment) {
    return res.status(404).json({ message: 'Shipment does not exist' });
    }
    const newDispatch = await Dispatch.create({shipmentId, vehicleId, driverId, scheduledDate, routeNotes} );
    vehicle.status = 'In-Use';
    await vehicle.save();
    driver.available = false;
    driver.assignedVehicleId = vehicleId;
    await driver.save();
    shipment.status = 'Assigned';
    await shipment.save();
    res.status(201).json({
    message: 'Dispatch successfully created',
    dispatch: {
        shipmentId: newDispatch.shipmentId,
        vehicleId: newDispatch.vehicleId,
        driverId: newDispatch.driverId,
        scheduledDate: newDispatch.scheduledDate,
        routeNotes: newDispatch.routeNotes,
        _id: newDispatch._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDispatches = async (req, res) => {
  try {
    const { date, status, page, limit } = req.query;
    const filter = {};
    if (date) {
    filter.scheduledDate = date;
    }
    if (status) {
    filter.status = status;
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const dispatches = await Dispatch.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Dispatch.countDocuments(filter);
    res.status(200).json({
    dispatches,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getDispatchById = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }
    res.status(200).json({ message: 'Dispatch found', dispatch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDispatches = async (req, res) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
        return res.status(404).json({message: 'Dispatch not found'});
    }
    const vehicle = await Vehicle.findById(dispatch.vehicleId);
    const driver = await Driver.findById(dispatch.driverId);
    const shipment = await Shipment.findById(dispatch.shipmentId);
    if (!vehicle) {
        return res.status(404).json({message: 'Vehicle does not exist'});
    }
    if (!driver) {
        return res.status(404).json({message: 'Driver does not exist'});
    }
    if (!shipment) {
        return res.status(404).json({message: 'Shipment does not exist'});
    }
    vehicle.status = 'Available';
    await vehicle.save();
    driver.available = true;
    driver.assignedVehicleId = null;
    await driver.save();
    shipment.status = 'Delivered';
    await shipment.save();
    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.status = 'Delivered';
      await order.save();
    }
    res.status(200).json({ message: 'Dispatch successfully updated'});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDispatch, getDispatches, getDispatchById, updateDispatches };


