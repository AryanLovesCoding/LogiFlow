const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ receiverId: req.user.userId, read: false }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
    if (!notification) {
        return res.status(404).json({message: 'No notifications found'})
    }
    res.status(200).json({ message: 'Notification marked as read', notification });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const notifications = await Notification.updateMany({ receiverId: req.user.userId, read: false }, { read: true })
    res.status(200).json({ message: 'All notifications marked as read' });
    } 
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getMyNotifications, markAsRead, markAllAsRead };


