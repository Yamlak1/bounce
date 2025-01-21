const WebSocket = require("ws");
const { registerUser, checkUser } = require("../services/userServices");
const LocalSession = require("telegraf-session-local");

const WEBSOCKET_URL = "wss://bounce-websocket.onrender.com";
const userSessions = {};

const commands = (bot) => {
  const GAME_URL = "https://bounce-frontend-seven.vercel.app";
  const localSession = new LocalSession({
    database: "session_db.json",
  });
  bot.use(localSession.middleware());

  bot.start(async (ctx) => {
    const chatId = ctx.chat?.id.toString();

    if (!chatId) {
      ctx.reply("Unable to identify your chat ID.");
      return;
    }

    const ws = connectToGame(chatId);

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
      ctx.session.step = "waitingForName";
      ctx.reply("You are not registered. Please provide your username.");
    }
  });

  bot.on("text", async (ctx) => {
    const chatId = ctx.chat?.id.toString();
    const messageText = ctx.message?.text;

    if (!chatId || !messageText) return;

    if (ctx.session.step === "waitingForName") {
      try {
        const responseMessage = await registerUser(chatId, messageText);
        ctx.session.step = null; // Clear the session state

        ctx.reply(responseMessage);
        ctx.reply("Registration complete! Ready to play?", {
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

        connectToGame(chatId);
      } catch (error) {
        console.error("Error registering user:", error);
        ctx.reply("Failed to register. Please try again.");
      }
    }
  });

  bot.on("callback_query", async (ctx) => {
    try {
      console.log("Callback query received:", ctx.callbackQuery?.data);

      if (!ctx.callbackQuery || !ctx.callbackQuery.data) {
        console.warn("Invalid or undefined callback query");
        await ctx.answerCbQuery("Invalid action.");
        return;
      }

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
