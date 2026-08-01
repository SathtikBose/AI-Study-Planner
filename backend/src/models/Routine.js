const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
  },
  subjectName: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  durationMinutes: {
    type: Number,
    required: true,
    default: 60,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const daySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  sessions: [sessionSchema],
});

const routineSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      dailyHours: {
        type: Number,
        default: 4,
      },
      excludedDays: {
        type: [String],
        default: [],
      },
      startDate: {
        type: Date,
        default: Date.now,
      },
    },
    days: [daySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Routine', routineSchema);
