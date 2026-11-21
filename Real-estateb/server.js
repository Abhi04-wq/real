require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

connectDB();
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Super Admin API running in ${process.env.NODE_ENV || "development"} on port ${PORT}`)
);
process.on("unhandledRejection", (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
