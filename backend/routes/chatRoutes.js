const express = require('express');
const router = express.Router();
const { getMessages, sendMessage, updateMessage, deleteMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// GET last 100 messages (auth required so only logged-in users can read)
router.get('/', authMiddleware, getMessages);

// POST a new message (auth required)
router.post('/', authMiddleware, sendMessage);

// PUT Update a message (auth required)
router.put('/:id', authMiddleware, updateMessage);

// DELETE a message (auth required)
router.delete('/:id', authMiddleware, deleteMessage);

module.exports = router;
