const Notification = require('./database/models/notificationSchema');
const ActivityLog = require('./database/models/activityLogSchema');

const sendNotification = async ({
  user,
  title,
  message,
  type = 'system',
  relatedId,
}) => {
  try {
    if (!user) return;
    await Notification.create({ user, title, message, type, relatedId });
  } catch (e) {
    console.log('Notification error:', e.message);
  }
};

const logActivity = async ({ user, role, action, details }) => {
  try {
    await ActivityLog.create({ user, role, action, details });
  } catch (e) {
    console.log('Activity log error:', e.message);
  }
};

module.exports = { sendNotification, logActivity };
