const { User } = require("../models");

const seedSuperAdmin = async () => {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";

  if (!email || !password) {
    console.warn("SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD not set; skipping super admin seed.");
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({
    $or: [{ email: normalizedEmail }, { username: username.trim() }]
  });

  if (existing) {
    let updated = false;

    if (existing.role !== "SUPER_ADMIN") {
      existing.role = "SUPER_ADMIN";
      updated = true;
    }

    if (existing.email !== normalizedEmail) {
      existing.email = normalizedEmail;
      updated = true;
    }

    if (updated) {
      await existing.save();
      console.log("Super admin account updated from environment.");
    }

    return;
  }

  await User.create({
    name,
    email: normalizedEmail,
    password,
    username: username.trim(),
    role: "SUPER_ADMIN",
    status: "active"
  });

  console.log("Super admin account seeded from environment.");
};

module.exports = seedSuperAdmin;
