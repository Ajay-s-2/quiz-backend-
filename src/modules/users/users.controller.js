const { User } = require("../../models");
const { toFrontendUser } = require("../../utils/roleMapping");

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const generateTemporaryPassword = () => {
  const random = Math.random().toString(36).slice(2, 8);
  return `Qz@${random}${Math.floor(100 + Math.random() * 900)}`;
};

const usernameFromEmail = (email) => email.split("@")[0].replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase();

const nextDisplayId = async (prefix) => {
  const count = await User.countDocuments({ displayId: { $regex: `^${prefix}-` } });
  return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

const normalizeRole = (role) => (role === "USER" ? "CANDIDATE" : role);

const parseCsvRows = (csv) => {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return headers.reduce((record, header, index) => {
      record[header] = values[index] || "";
      return record;
    }, {});
  });

  return { headers, rows };
};

const buildAdminPdf = (admins) => {
  const rows = admins.map((admin) => {
    const user = toFrontendUser(admin);
    return `${user.displayId || ""} | ${user.name} | ${user.email} | ${user.status} | ${user.createdDate || ""}`;
  });
  const text = ["Admin Export", "ID | Name | Email | Status | Created", ...rows].join("\\n");
  const stream = `BT /F1 10 Tf 40 760 Td (${text.replace(/[()]/g, "")}) Tj ET`;

  return Buffer.from(
    `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj
4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
5 0 obj << /Length ${stream.length} >> stream
${stream}
endstream endobj
trailer << /Root 1 0 R >>
%%EOF`
  );
};

const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role === "CANDIDATE" ? { $in: ["CANDIDATE", "USER"] } : role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } }
      ];
    }

    // Include temporaryPassword field (normally hidden by select: false)
    const users = await User.find(filter).select("+temporaryPassword").sort({ createdAt: -1 });

    const mappedUsers = users.map((user) => {
      const frontendUser = toFrontendUser(user);
      // Include temporaryPassword in response if it exists
      if (user.temporaryPassword) {
        frontendUser.temporaryPassword = user.temporaryPassword;
      }
      return frontendUser;
    });

    res.status(200).json({
      success: true,
      data: mappedUsers
    });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: toFrontendUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, department } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An admin with this email already exists"
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    const displayId = await nextDisplayId("ADM");
    const user = await User.create({
      name,
      email,
      phone,
      department,
      username: usernameFromEmail(email),
      password: temporaryPassword,
      temporaryPassword, // Store plain text temporary password for admin display
      displayId,
      role: "ADMIN",
      status: "active",
      isFirstLogin: true
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: {
        user: toFrontendUser(user),
        temporaryPassword
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A user with this email, username, or display ID already exists"
      });
    }
    next(error);
  }
};

const bulkCreateAdmins = async (req, res, next) => {
  try {
    const { headers, rows } = parseCsvRows(req.body.csv);
    const hasName = headers.includes("name") || headers.includes("admin name");
    const hasEmail = headers.includes("email") || headers.includes("email address");

    if (!hasName || !hasEmail) {
      return res.status(400).json({
        success: false,
        message: "CSV must include Admin Name and Email Address columns"
      });
    }

    const existingEmails = new Set((await User.find({ role: "ADMIN" }).select("email")).map((user) => user.email));
    const seenEmails = new Set();
    const created = [];
    const issues = [];

    for (const [index, row] of rows.entries()) {
      const name = row.name || row["admin name"];
      const email = (row.email || row["email address"] || "").toLowerCase();

      if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        issues.push({ row: index + 2, reason: "Invalid name or email" });
        continue;
      }

      if (seenEmails.has(email) || existingEmails.has(email)) {
        issues.push({ row: index + 2, reason: "Duplicate admin email", email });
        continue;
      }

      seenEmails.add(email);
      const temporaryPassword = generateTemporaryPassword();
      const user = await User.create({
        name,
        email,
        username: usernameFromEmail(email),
        password: temporaryPassword,
        temporaryPassword, // Store plain text temporary password for admin display
        displayId: await nextDisplayId("ADM"),
        role: "ADMIN",
        status: "active",
        isFirstLogin: true
      });
      created.push({ user: toFrontendUser(user), temporaryPassword });
    }

    res.status(201).json({
      success: true,
      data: {
        created,
        summary: {
          totalRecords: rows.length,
          validRecords: created.length,
          duplicateRecords: issues.filter((issue) => issue.reason.includes("Duplicate")).length,
          invalidRecords: issues.filter((issue) => !issue.reason.includes("Duplicate")).length,
          issues
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, status, batch, department, role } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (status) user.status = status;
    if (batch) user.batch = batch;
    if (department !== undefined) user.department = department || "";
    if (role) user.role = normalizeRole(role);

    await user.save();

    res.status(200).json({
      success: true,
      data: toFrontendUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.status(200).json({
      success: true,
      data: toFrontendUser(user)
    });
  } catch (error) {
    next(error);
  }
};

const resetUserPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    user.temporaryPassword = temporaryPassword; // Store plain text temporary password for admin display
    user.isFirstLogin = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: {
        user: toFrontendUser(user),
        temporaryPassword
      }
    });
  } catch (error) {
    next(error);
  }
};

const exportAdmins = async (req, res, next) => {
  try {
    const format = req.params.format;
    const admins = await User.find({ role: "ADMIN" }).sort({ createdAt: -1 });

    if (format === "csv") {
      const rows = admins.map((admin) => {
        const user = toFrontendUser(admin);
        return [user.displayId, user.name, user.email, user.status, user.createdDate].map(escapeCsv).join(",");
      });
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=admins.csv");
      return res.send(["Admin ID,Admin Name,Email,Status,Created Date", ...rows].join("\n"));
    }

    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=admins.pdf");
      return res.send(buildAdminPdf(admins));
    }

    res.status(400).json({
      success: false,
      message: "Unsupported export format"
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

const updateAverageScore = async (req, res, next) => {
  try {
    const { averageScore, completedQuizzes } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (averageScore !== undefined) user.averageScore = averageScore;
    if (completedQuizzes !== undefined) user.completedQuizzes = completedQuizzes;

    await user.save();

    res.status(200).json({
      success: true,
      data: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createAdmin,
  bulkCreateAdmins,
  updateUser,
  updateUserStatus,
  resetUserPassword,
  exportAdmins,
  deleteUser,
  updateAverageScore
};
