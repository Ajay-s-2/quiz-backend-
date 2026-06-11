const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  answers: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["in_progress", "completed", "submitted"],
    default: "in_progress"
  },
  resultStatus: {
    type: String,
    enum: ["Pass", "Fail"],
    default: "Fail"
  },
  accuracy: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number,
    default: 0
  },
  warnings: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  }
}, {
  timestamps: true
});

// Calculate rank based on score in the same quiz
attemptSchema.methods.calculateRank = async function() {
  const Attempt = mongoose.model("Attempt");
  const attempts = await Attempt.find({ 
    quiz: this.quiz,
    status: "completed"
  }).sort({ score: -1, percentage: -1 });
  
  const rank = attempts.findIndex(a => a._id.toString() === this._id.toString()) + 1;
  return rank;
};

module.exports = mongoose.model("Attempt", attemptSchema);
