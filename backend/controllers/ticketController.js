const Ticket = require('../models/Ticket');

const createTicket = async (req, res) => {
  try {
    const {title, description, priority, linkedOrderId} = req.body;
    const newTicket = await Ticket.create({title, description, priority, linkedOrderId});
    res.status(201).json({
    message: 'Ticket successfully created',
    ticket: {
        title: newTicket.title,
        description: newTicket.description,
        priority: newTicket.priority,
        linkedOrderId: newTicket.linkedOrderId,
        _id: newTicket._id
    }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTickets = async (req, res) => {
  try {
    const { status, priority, page, limit } = req.query;
    const filter = {};
    if (status) {
    filter.status = status;
    }
    if (priority) {
    filter.priority = priority;
    }
    const currentPage = Number(page) || 1;
    const pageLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * pageLimit;
    const tickets = await Ticket.find(filter).skip(skip).limit(pageLimit);
    const totalCount = await Ticket.countDocuments(filter);
    res.status(200).json({
    tickets,
    totalCount,
    currentPage,
    totalPages: Math.ceil(totalCount / pageLimit)
    });
    }
  catch (error){
    res.status(500).json({ message: error.message });
  }
};

const assignTicket = async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { assigneeId: req.body.assigneeId },
      { new: true }
    );
    if (!updatedTicket) {
    return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        ticket: updatedTicket
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicketStatus = async (req, res) => {
  try {
    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id, 
        { status: req.body.status }, 
        { new: true }
    );
    if (!updatedTicket) {
    return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json({
        message: 'Updated successfully',
        ticket: updatedTicket
    })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const newComment = {
      content: req.body.content,
      userId: req.user.userId
    };
    ticket.comments.push(newComment);
    await ticket.save();
    res.status(200).json({message: 'Comment added successfully', ticket: ticket});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTicket, getTickets, assignTicket, updateTicketStatus, addComment  };


