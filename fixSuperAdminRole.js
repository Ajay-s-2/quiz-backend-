/**
 * Quick fix script to update superadmin role in database
 * Run this with: node fixSuperAdminRole.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const { User } = require("./src/models");

const fix = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to database");

    // Find the superadmin user
    const user = await User.findOne({ email: "superadmin@quizapp.com" });

    if (!user) {
      console.log("✗ User not found. Run seed script first.");
      process.exit(0);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === "SUPER_ADMIN") {
      console.log("✓ User is already SUPER_ADMIN");
      process.exit(0);
    }

    // Update role to SUPER_ADMIN
    user.role = "SUPER_ADMIN";
    await user.save();

    console.log(`✓ Updated role to: ${user.role}`);
    console.log("\nUser is now ready to login as SUPER_ADMIN!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
};

fix();
