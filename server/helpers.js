const Notification = require('./database/models/notificationSchema');
const ActivityLog = require('./database/models/activityLogSchema');
const { emitToUser } = require('./socket');

const sendNotification = async ({
  user,
  title,
  message,
  type = 'system',
  relatedId,
}) => {
  try {
    if (!user) return;
    const notification = await Notification.create({
      user,
      title,
      message,
      type,
      relatedId,
    });
    emitToUser(user, 'notification:new', {
      _id: notification._id,
      title,
      message,
      type,
      relatedId,
      read: false,
      createdAt: notification.createdAt,
    });
    return notification;
  } catch (e) {
    console.log('Notification error:', e.message);
  }
};

const logActivity = async ({ user, role, action, details }) => {
  try {
    const activity = await ActivityLog.create({ user, role, action, details });
    emitToUser(user, 'activity:new', activity);
    return activity;
  } catch (e) {
    console.log('Activity log error:', e.message);
  }
};

module.exports = { sendNotification, logActivity };
