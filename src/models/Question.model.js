const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  section: {
    type: String,
    enum: ["Aptitude", "Reasoning", "Technical", "Programming"],
    required: true
  },
  type: {
    type: String,
    enum: ["Single Choice", "Multiple Choice", "Fill Blank", "True/False", "Checklist"],
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    default: "Medium"
  },
  marks: {
    type: Number,
    required: true,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
  },
  options: [{
    type: String
  }],
  answer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Question", questionSchema);
