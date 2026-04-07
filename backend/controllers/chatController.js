const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

// Fetch last 100 messages (oldest first for display)
const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Save a message and emit via socket
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    if (message.length > 300) {
      return res.status(400).json({ message: 'Message too long (max 300 chars)' });
    }

    // Fetch latest user data for name/img
    const user = await User.findById(req.userId).select('name profileImg');
    if (!user) return res.status(401).json({ message: 'User not found' });

    const chatMsg = await ChatMessage.create({
      userId: req.userId,
      senderName: user.name,
      senderImg: user.profileImg || '',
      message: message.trim(),
    });

    // Emit to all connected clients via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('chat:receive', chatMsg);
    }

    res.status(201).json(chatMsg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
};

// Update a message
const updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const chatMsg = await ChatMessage.findById(id);
    if (!chatMsg) return res.status(404).json({ message: 'Message not found' });

    // Verify ownership
    if (chatMsg.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to edit this message' });
    }

    chatMsg.message = message.trim();
    chatMsg.isEdited = true;
    chatMsg.updatedAt = Date.now();
    await chatMsg.save();

    // Broadcast update
    const io = req.app.get('io');
    if (io) {
      io.emit('chat:update', chatMsg);
    }

    res.json(chatMsg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update message' });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const chatMsg = await ChatMessage.findById(id);
    if (!chatMsg) return res.status(404).json({ message: 'Message not found' });

    // Verify ownership
    if (chatMsg.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this message' });
    }

    await ChatMessage.findByIdAndDelete(id);

    // Broadcast deletion
    const io = req.app.get('io');
    if (io) {
      io.emit('chat:delete', id);
    }

    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete message' });
  }
};

module.exports = { getMessages, sendMessage, updateMessage, deleteMessage };
