import express from "express";
import { sequelize } from "./models/user"; // Import Sequelize instance
import userRoutes from "./routes/userRoutes"; // Import user routes
import { startWebSocketServer } from "./socket/webSocketServer";

const app = express();
const PORT = 8080;

// Middleware for JSON parsing
app.use(express.json());

// User routes
app.use("/api/users", userRoutes);

// Sync the database
sequelize.sync().then(() => {
  console.log("Database synchronized");
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

const WS_PORT = 8081; // WebSocket server port
startWebSocketServer(WS_PORT);