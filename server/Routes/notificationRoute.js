const express = require('express');
const Notification = require('../database/models/notificationSchema');
const checkToken = require('../middleware/checkToken');

const router = express.Router();

router.get(
  '/notifications/user/:id',
  checkToken(['admin', 'doctor', 'patient']),
  async (req, res) => {
    try {
      const { page, limit } = req.query;
      const p = Number(page) || 1;
      const l = Number(limit) || 10;
      const skip = (p - 1) * l;

      const notifications = await Notification.find({ user: req.params.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l);

      const total = await Notification.countDocuments({ user: req.params.id });
      const unread = await Notification.countDocuments({
        user: req.params.id,
        read: false,
      });

      res.status(200).json({
        items: notifications,
        total,
        unread,
        page: p,
        totalPages: Math.ceil(total / l) || 1,
      });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.get(
  '/notifications/unread/:id',
  checkToken(['admin', 'doctor', 'patient']),
  async (req, res) => {
    try {
      const unread = await Notification.countDocuments({
        user: req.params.id,
        read: false,
      });
      res.status(200).json({ unread });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.patch(
  '/notifications/read/:id',
  checkToken(['admin', 'doctor', 'patient']),
  async (req, res) => {
    try {
      await Notification.findByIdAndUpdate(req.params.id, { read: true });
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

router.patch(
  '/notifications/read-all',
  checkToken(['admin', 'doctor', 'patient']),
  async (req, res) => {
    try {
      const { userId } = req.body;
      await Notification.updateMany({ user: userId, read: false }, { read: true });
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (e) {
      return res.status(500).json({ message: e.message });
    }
  }
);

module.exports = router;
