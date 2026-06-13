require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/database");
const seedSuperAdmin = require("./src/utils/seedSuperAdmin");

const start = async () => {
  await connectDB();
  await seedSuperAdmin();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`localhost:${PORT}`);
  });
};

start();
