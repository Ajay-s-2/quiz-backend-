const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  displayId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  role: {
    type: String,
    enum: ["SUPER_ADMIN", "ADMIN", "CANDIDATE", "USER"],
    default: "CANDIDATE"
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active"
  },
  batch: {
    type: String,
    default: ""
  },
  department: {
    type: String,
    trim: true,
    default: ""
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  temporaryPassword: {
    type: String,
    select: false
  },
  passwordChangedAt: {
    type: Date
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization"
  },
  averageScore: {
    type: Number,
    default: 0
  },
  completedQuizzes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to remove password from response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
