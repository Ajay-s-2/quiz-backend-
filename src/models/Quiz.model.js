const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  duration: {
    type: Number,
    required: true,
    default: 60
  },
  passPercentage: {
    type: Number,
    required: true,
    default: 50
  },
  maxMarks: {
    type: Number,
    required: true,
    default: 100
  },
  status: {
    type: String,
    enum: ["draft", "published"],
    default: "draft"
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }],
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },
  assigned: {
    type: Number,
    default: 0
  },
  completed: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Quiz", quizSchema);
