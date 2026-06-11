const { User } = require("../../models");

const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });

    // Map roles to frontend expected format
    const roleMapping = {
      "SUPER_ADMIN": "admin",
      "ADMIN": "admin",
      "USER": "student"
    };

    const mappedUsers = users.map(user => ({
      ...user.toJSON(),
      role: roleMapping[user.role] || user.role.toLowerCase()
    }));

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

    const roleMapping = {
      "SUPER_ADMIN": "admin",
      "ADMIN": "admin",
      "USER": "student"
    };

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        role: roleMapping[user.role] || user.role.toLowerCase()
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, phone, status, batch, role } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (status) user.status = status;
    if (batch) user.batch = batch;
    if (role) user.role = role;

    await user.save();

    const roleMapping = {
      "SUPER_ADMIN": "admin",
      "ADMIN": "admin",
      "USER": "student"
    };

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        role: roleMapping[user.role] || user.role.toLowerCase()
      }
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
  updateUser,
  deleteUser,
  updateAverageScore
};
