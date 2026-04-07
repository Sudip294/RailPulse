const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Get current user profile + stats
router.get('/profile', authMiddleware, userController.getProfile);
// Get specific user profile + stats by ID
router.get('/profile/:id', authMiddleware, userController.getProfile);

// Update name, bio, profile image
router.put('/profile', authMiddleware, userController.updateProfile);

// Delete account + user data (Cleanup)
router.post('/delete-account', authMiddleware, userController.deleteAccount);

module.exports = router;
