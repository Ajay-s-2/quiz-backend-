const toFrontendRole = (dbRole) => {
  const roleMapping = {
    SUPER_ADMIN: "super-admin",
    ADMIN: "admin",
    CANDIDATE: "candidate",
    USER: "candidate"
  };

  const role = roleMapping[dbRole];
  if (!role) {
    throw new Error(`Invalid user role: ${dbRole}`);
  }
  return role;
};

const toFrontendUser = (user) => {
  const data = user.toJSON ? user.toJSON() : user.toObject();

  return {
    ...data,
    id: data._id?.toString(),
    role: toFrontendRole(data.role),
    dbRole: data.role === "USER" ? "CANDIDATE" : data.role,
    createdDate: data.createdAt ? data.createdAt.toISOString().slice(0, 10) : undefined,
    completed: data.completedQuizzes,
    // Preserve temporaryPassword if it exists (for admin display)
    temporaryPassword: data.temporaryPassword
  };
};

module.exports = { toFrontendRole, toFrontendUser };
