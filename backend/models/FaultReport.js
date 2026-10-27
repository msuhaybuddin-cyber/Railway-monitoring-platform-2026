const mongoose = require('mongoose');

const faultReportSchema = new mongoose.Schema(
  {
    faultId: {
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
      required: [true, 'Railway Station is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Fault Description is required'],
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      required: true,
    },
    reportedAt: {
      type: Date,
      default: Date.now,
    },
    reportedBy: {
      type: String,
      required: [true, 'Reported By is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('FaultReport', faultReportSchema);
