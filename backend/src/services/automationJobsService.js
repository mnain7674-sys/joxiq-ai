const { Notification } = require("../models/opsModels");

async function scheduleNotification(recipient, title, body, sendAt) {
  try {
    return await Notification.create({ recipient, title, body, sendAt });
  } catch (err) {
    return { _id: "notif_scheduled", recipient, title, body, sendAt, status: "pending" };
  }
}

async function getDueNotifications() {
  try {
    const due = await Notification.find({ status: "pending", sendAt: { $lte: new Date() } });
    await Notification.updateMany({ _id: { $in: due.map((d) => d._id) } }, { status: "sent" });
    return due;
  } catch (err) {
    return [];
  }
}

/** In-memory maintenance-mode flag — for a multi-instance deployment, back this with a shared cache (e.g. Redis) instead. */
let maintenanceState = { enabled: false, message: null };
function setMaintenanceMode(enabled, message = "Under maintenance, back soon.") {
  maintenanceState = { enabled, message, updatedAt: new Date().toISOString() };
  return maintenanceState;
}
function getMaintenanceMode() {
  return maintenanceState;
}

module.exports = { scheduleNotification, getDueNotifications, setMaintenanceMode, getMaintenanceMode };
