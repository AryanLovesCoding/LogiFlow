const Customer = require('../models/Customer');

const createCustomer = async (req, res) => {
  try {
    const {companyName, contactPersonName, email, phone, address, creditLimit, accountStatus} = req.body;
    const newCustomer = await Customer.create({companyName, contactPersonName, email, phone, address, creditLimit, accountStatus});
    res.status(201).json({
    message: 'Customer successfully created',
    customer: {
        companyName: newCustomer.companyName,
        contactPersonName: newCustomer.contactPersonName,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        creditLimit: newCustomer.creditLimit,
        accountStatus: newCustomer.accountStatus,
        _id: newCustomer._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const { companyName, email, accountStatus, page, limit } = req.query;
    const filter = {};
    if (companyName) {
    filter.companyName = { $regex: companyName, $options: 'i' };
    }
    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (accountStatus) {
      filter.accountStatus = accountStatus;
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const customers = await Customer.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Customer.countDocuments(filter);
    res.status(200).json({
    customers,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({ message: 'Customer found', customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const updateCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updateCustomer) {
    return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        customer: updateCustomer
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
    try{
        const deletedCustomer = await Customer.findByIdAndUpdate(
        req.params.id,
        { accountStatus: 'Inactive' },
        { new : true}
        );
        if (!deletedCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
        }
        res.status(200).json({
            message: 'Deleted successfully',
            customer: deletedCustomer
        })
    }
    catch(error){
    res.status(500).json({ message: error.message });
    }
};

module.exports = { createCustomer, getCustomer, getCustomerById, updateCustomer, deleteCustomer };


