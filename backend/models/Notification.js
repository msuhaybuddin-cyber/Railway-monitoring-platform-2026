const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['fault_reported', 'fault_resolved', 'maintenance_due', 'maintenance_overdue', 'system'],
      default: 'system',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical', 'info', 'success'],
      default: 'info',
    },
    referenceId: {
      type: String, // faultId or maintenanceId or equipmentId
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
