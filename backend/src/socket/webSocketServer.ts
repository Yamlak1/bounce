import WebSocket from "ws";

// Store active WebSocket connections
const clients: { [key: string]: WebSocket } = {};

// Start WebSocket server
export const startWebSocketServer = (port: number) => {
  const wss = new WebSocket.Server({ port });

  console.log(`WebSocket server is running on ws://localhost:${port}`);

  wss.on("connection", (ws, req) => {
    console.log("New client connected");

    // Assign an ID to the client (can be user-specific or random)
    const clientId = req.socket.remoteAddress || `client-${Date.now()}`;
    clients[clientId] = ws;

    // Handle incoming messages
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString()); // Parse incoming message
        console.log(`Received message from ${clientId}:`, parsedMessage);

        // Broadcast the message to all clients (including formatting as JSON)
        Object.values(clients).forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(parsedMessage)); // Send properly formatted JSON
          }
        });
      } catch (error) {
        if (error instanceof Error) {
          console.error("Invalid message format:", error.message);
          ws.send(
            JSON.stringify({ error: "Invalid message format", details: error.message })
          );
        } else {
          console.error("Unknown error occurred");
          ws.send(
            JSON.stringify({ error: "Unknown error occurred", details: "No message available" })
          );
        }
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log(`Client disconnected: ${clientId}`);
      delete clients[clientId];
    });

    // Handle errors
    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
    });
  });

  return wss;
};
