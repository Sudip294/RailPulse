const express = require('express');
const router = express.Router();
const { subscribe, getPublicKey, unsubscribe } = require('../controllers/pushController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/subscribe', authMiddleware, subscribe);
router.post('/unsubscribe', authMiddleware, unsubscribe);
router.get('/vapidPublicKey', getPublicKey); 

module.exports = router;
