// const WebSocket = require("ws");
// const { registerUser, checkUser } = require("../services/userServices");

// const WEBSOCKET_URL = "ws://localhost:8081"; // Backend WebSocket URL

// // Store user sessions and WebSocket connections
// const userSessions = {};

// const commands = (bot) => {
//   const GAME_URL = "https://1d23-44-201-174-149.ngrok-free.app"; // Frontend game URL
//   const userRegistration = {}; // Temporary in-memory storage for pending registrations

//   // Start Command
//   bot.start(async (ctx) => {
//     const chatId = ctx.chat?.id.toString();
//     const username = ctx.chat?.username || "Unknown";

//     if (!chatId) {
//       ctx.reply("Unable to identify your chat ID.");
//       return;
//     }

//     try {
//       // Check if the user is already registered
//       const userExists = await checkUser(chatId);

//       if (userExists) {
//         // Send game opener with inline control buttons
//         ctx.reply("Welcome back! Ready to play the game?", {
//           reply_markup: {
//             inline_keyboard: [
//               [{ text: "🎮 Play Game", web_app: { url: GAME_URL } }],
//               [
//                 { text: "⬆️ Jump", callback_data: "jump" },
//                 { text: "⏩ Accelerate", callback_data: "accelerate" },
//               ],
//               [
//                 { text: "⏪ Decelerate", callback_data: "decelerate" },
//                 { text: "🔄 Reverse", callback_data: "reverse" },
//               ],
//             ],
//           },
//         });

//         // Connect user to the game WebSocket if not already connected
//         connectToGame(chatId);
//       } else {
//         // Ask for username to register
//         userRegistration[chatId] = true;
//         ctx.reply("Please provide your player name to register.");
//       }
//     } catch (error) {
//       console.error("Error checking user:", error);
//       ctx.reply("An error occurred. Please try again later.");
//     }
//   });

//   // Handle text messages (e.g., username input)
//   bot.on("text", async (ctx) => {
//     const chatId = ctx.chat?.id.toString();
//     const messageText = ctx.message?.text;

//     if (userRegistration[chatId]) {
//       try {
//         const responseMessage = await registerUser(chatId, messageText);
//         delete userRegistration[chatId]; // Clear pending registration

//         // Confirm registration and send game opener with controls
//         ctx.reply(responseMessage);
//         ctx.reply("Registration complete! Ready to play the game?", {
//           reply_markup: {
//             inline_keyboard: [
//               [{ text: "🎮 Play Game", web_app: { url: GAME_URL } }],
//               [
//                 { text: "⬆️ Jump", callback_data: "jump" },
//                 { text: "⏩ Accelerate", callback_data: "accelerate" },
//               ],
//               [
//                 { text: "⏪ Decelerate", callback_data: "decelerate" },
//                 { text: "🔄 Reverse", callback_data: "reverse" },
//               ],
//             ],
//           },
//         });

//         // Connect user to the game WebSocket
//         connectToGame(chatId);
//       } catch (error) {
//         console.error("Error registering user:", error);
//         ctx.reply("Failed to register. Please try again.");
//       }
//     }
//   });

//   // Handle inline button presses (callback queries)
//   bot.on("callback_query", async (ctx) => {
//     const chatId = ctx.chat?.id.toString();
//     const action = ctx.callbackQuery.data;

//     if (!chatId) {
//       ctx.answerCbQuery("Chat ID not found.");
//       return;
//     }

//     if (!userSessions[chatId]) {
//       ctx.answerCbQuery("You are not connected to the game.");
//       return;
//     }

//     const ws = userSessions[chatId];

//     if (ws && ws.readyState === WebSocket.OPEN) {
//       try {
//         // Send the action to the WebSocket server
//         ws.send(JSON.stringify({ action }));
//         ctx.answerCbQuery(`Command '${action}' sent to the game.`);
//       } catch (error) {
//         console.error(`Failed to send action '${action}' for user ${chatId}:`, error);
//         ctx.answerCbQuery("Failed to send command to the game.");
//       }
//     } else {
//       ctx.answerCbQuery("Connection to the game is not active.");
//     }
//   });

//   // Helper: Connect to WebSocket for game control
//   const connectToGame = (chatId) => {
//     if (userSessions[chatId]) {
//       console.log(`WebSocket already connected for user: ${chatId}`);
//       return;
//     }

//     const ws = new WebSocket(WEBSOCKET_URL);

//     ws.on("open", () => {
//       userSessions[chatId] = ws;
//       console.log(`WebSocket connected for user: ${chatId}`);
//     });

//     ws.on("close", () => {
//       delete userSessions[chatId];
//       console.log(`WebSocket closed for user: ${chatId}`);
//     });

//     ws.on("error", (error) => {
//       console.error(`WebSocket error for user: ${chatId}`, error);
//     });
//   };
// };

// module.exports = { commands };


const WebSocket = require("ws");
const { registerUser, checkUser } = require("../services/userServices");

const WEBSOCKET_URL = "ws://localhost:8081"; // Backend WebSocket URL

// Store user sessions and WebSocket connections
const userSessions = {};

const commands = (bot) => {
  const GAME_URL = "https://1d23-44-201-174-149.ngrok-free.app"; // Frontend game URL

  bot.start(async (ctx) => {
    const chatId = ctx.chat?.id.toString();

    if (!chatId) {
      ctx.reply("Unable to identify your chat ID.");
      return;
    }

    const ws = connectToGame(chatId);

    // Register or send game controls
    const userExists = await checkUser(chatId);
    if (userExists) {
      ctx.reply("Welcome back! Ready to play?", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎮 Play Game", web_app: { url: GAME_URL } }],
            [
              { text: "⬆️ Jump", callback_data: "jump" },
              { text: "⏩ Accelerate", callback_data: "accelerate" },
            ],
            [
              { text: "⏪ Decelerate", callback_data: "decelerate" },
              { text: "🔄 Reverse", callback_data: "reverse" },
            ],
          ],
        },
      });
    } else {
      ctx.reply("You are not registered. Please provide your username.");
    }
  });

  bot.on("callback_query", async (ctx) => {
    try {
      console.log("Callback query received:", ctx.callbackQuery.data);
  
      if (!ctx.callbackQuery.data || !ctx.callbackQuery) {
        console.warn("Invalid or undefined callback query");
        await ctx.answerCbQuery("Invalid action.");
        return;
      }
  
      // Extract chatId and action
      const chatId = ctx.chat?.id.toString();
      const action = ctx.callbackQuery.data;
  
      if (!chatId || !action) {
        console.warn("Missing chatId or action");
        await ctx.answerCbQuery("Invalid action or user.");
        return;
      }
  
      const ws = userSessions[chatId];
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ chatId, action }));
        console.log(`Command '${action}' sent to chatId: ${chatId}`);
        await ctx.answerCbQuery(`Command '${action}' sent.`);
      } else {
        console.warn(`WebSocket not active for chatId: ${chatId}`);
        await ctx.answerCbQuery("WebSocket connection is not active.");
      }
    } catch (error) {
      console.error("Error handling callback query:", error);
    }
  });
  
  
  

  const connectToGame = (chatId) => {
    if (!userSessions[chatId]) {
      const ws = new WebSocket(WEBSOCKET_URL);

      ws.on("open", () => {
        userSessions[chatId] = ws;
        console.log(`WebSocket connected for chatId: ${chatId}`);
      });

      ws.on("close", () => {
        delete userSessions[chatId];
        console.log(`WebSocket closed for chatId: ${chatId}`);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for chatId ${chatId}:`, error);
      });

      return ws;
    }

    return userSessions[chatId];
  };
};

module.exports = { commands };
