import express from "express";
import { sequelize } from "./models/user";
import userRoutes from "./routes/userRoutes";
import { startWebSocketServer } from "./socket/webSocketServer";

const app = express();
const PORT = 8080;

app.use(express.json());

app.use("/api/users", userRoutes);

sequelize.sync().then(() => {
  console.log("Database synchronized");
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});

const WS_PORT = 8081;
startWebSocketServer(WS_PORT);
