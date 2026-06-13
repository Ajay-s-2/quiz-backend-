const toFrontendRole = (dbRole) => {
  const roleMapping = {
    SUPER_ADMIN: "super-admin",
    ADMIN: "admin",
    USER: "student"
  };

  return roleMapping[dbRole] || dbRole.toLowerCase();
};

const toFrontendUser = (user) => ({
  ...user.toJSON(),
  role: toFrontendRole(user.role)
});

module.exports = { toFrontendRole, toFrontendUser };
