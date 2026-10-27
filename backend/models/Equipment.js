const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: String,
      required: [true, 'Equipment ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'Equipment Name is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Equipment Type is required'],
      enum: [
        'Railway Signal Lights',
        'Track Circuits',
        'Point Machines',
        'Axle Counters',
        'Signal Control Units',
        'Interlocking Systems',
      ],
    },
    station: {
      type: String,
      required: [true, 'Railway Station / Location is required'],
      trim: true,
    },
    installationDate: {
      type: Date,
      required: [true, 'Installation Date is required'],
      default: Date.now,
    },
    lastMaintenanceDate: {
      type: Date,
      default: Date.now,
    },
    nextMaintenanceDate: {
      type: Date,
      required: [true, 'Next Maintenance Date is required'],
    },
    status: {
      type: String,
      enum: ['Working', 'Faulty', 'Under Maintenance'],
      default: 'Working',
    },
    healthPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 95,
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Equipment', equipmentSchema);
