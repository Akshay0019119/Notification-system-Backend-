const express = require('express');
const router = express.Router();
const { sendNotification, getUserNotifications } = require('../controllers/notificationController');

// POST /api/notifications
router.post('/notifications', sendNotification);

// GET /api/users/:id/notifications
router.get('/users/:id/notifications', getUserNotifications);

module.exports = router;
