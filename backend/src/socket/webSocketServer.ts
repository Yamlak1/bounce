import WebSocket from "ws";

const clients: { [key: string]: WebSocket } = {};

export const startWebSocketServer = (port: number) => {
  const wss = new WebSocket.Server({ port });

  console.log(`WebSocket server is running on ws://localhost:${port}`);

  wss.on("connection", (ws, req) => {
    console.log("New client connected");

    const clientId = req.socket.remoteAddress || `client-${Date.now()}`;
    clients[clientId] = ws;

    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());
        console.log(`Received message from ${clientId}:`, parsedMessage);

        Object.values(clients).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage));
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Invalid message format:", error.message);
          ws.send(
            JSON.stringify({
              error: "Invalid message format",
              details: error.message,
            })
          );
        } else {
          console.error("Unknown error occurred");
          ws.send(
            JSON.stringify({
              error: "Unknown error occurred",
              details: "No message available",
            })
          );
        }
      }
    });

    ws.on("close", () => {
      console.log(`Client disconnected: ${clientId}`);
      delete clients[clientId];
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  });

  return wss;
};
