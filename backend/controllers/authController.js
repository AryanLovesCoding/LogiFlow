const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const {name, email, password, role} = req.body;
    const hash = await bcrypt.hash(password, 12);
    const newUser = await User.create({name: name, email: email, password: hash, role: role});
    res.status(201).json({
    message: 'User successfully created',
    user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
    }
    });
  }
  catch (error) {
  res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch){
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' })
        return res.status(200).json({message: 'Login successful', token: token});
    }
    else{
        return res.status(401).json({ message: 'Login unsuccessful' });
    };
    }
    catch (error) {
    res.status(500).json({ message: error.message });
    }
};

const logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { register, login, logout, getMe, getAllUsers };

