const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema(
  {
    maintenanceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: false,
    },
    equipmentId: {
      type: String,
      required: [true, 'Equipment ID is required'],
      trim: true,
    },
    equipmentName: {
      type: String,
      required: [true, 'Equipment Name is required'],
      trim: true,
    },
    station: {
      type: String,
      default: '',
    },
    maintenanceType: {
      type: String,
      required: [true, 'Maintenance Type is required'],
      enum: [
        'Routine Inspection',
        'Preventive Overhaul',
        'Emergency Repair',
        'Signal Calibration',
        'Track Circuit Test',
        'Point Machine Lubrication',
      ],
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled Date is required'],
    },
    completedDate: {
      type: Date,
    },
    technicianName: {
      type: String,
      required: [true, 'Technician Name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Maintenance Description is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Overdue'],
      default: 'Scheduled',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to calculate Overdue dynamically on save
maintenanceSchema.pre('save', function (next) {
  if (this.status !== 'Completed' && this.scheduledDate && new Date(this.scheduledDate) < new Date()) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
