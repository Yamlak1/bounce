import { Telegraf } from "telegraf";
import WebSocket from "ws";
import { registerUser, checkUser } from "./services/userServices";
import { Chat } from "telegraf/typings/core/types/typegram";

const BOT_TOKEN = "7508529320:AAHqc07Rq5JwkHY-2fq2COy4s6QUOIJqgFo";
const WEBSOCKET_URL = "ws://localhost:8080"; // Backend server WebSocket URL

const bot = new Telegraf(BOT_TOKEN);

// Store user session and WebSocket connection
const userSessions: { [key: string]: WebSocket } = {};

// Helper function: Check if chat is a PrivateChat
const isPrivateChat = (chat: Chat): chat is Chat.PrivateChat => {
  return chat.type === "private";
};

// Command: Start registration or go directly to the game
bot.start(async (ctx) => {
  const chatId = ctx.chat?.id.toString();
  const username = isPrivateChat(ctx.chat) ? ctx.chat.username : "Unknown";

  if (!chatId) {
    ctx.reply("Unable to identify your chat ID.");
    return;
  }

  try {
    // Check if the user is already registered
    const userExists = await checkUser(chatId);

    if (userExists) {
      // User is already registered, directly connect to the game
      ctx.reply("Welcome back! Connecting you to the game...");
      connectToGame(chatId, ctx);
    } else {
      // User is not registered, show the registration button
      ctx.reply(
        "Welcome! Click the button below to register and control the game.",
        {
          reply_markup: {
            inline_keyboard: [
              [{ text: "Register", callback_data: "register" }],
            ],
          },
        }
      );
    }
  } catch (error) {
    ctx.reply("An error occurred. Please try again later.");
  }
});

// Handle registration
bot.on("callback_query", async (ctx) => {
  const callbackQuery = ctx.callbackQuery;

  if (callbackQuery && "data" in callbackQuery) {
    const data = callbackQuery.data;
    if (data === "register") {
      const chatId = ctx.chat?.id.toString();
      const username = isPrivateChat(ctx.chat) ? ctx.chat.username : "Unknown";

      if (chatId) {
        try {
          const message = await registerUser(chatId, username);
          ctx.reply(message);

          // Connect the user to the game after registration
          connectToGame(chatId, ctx);
        } catch (error) {
          ctx.reply((error as Error).message);
        }
      }
    }
  } else {
    ctx.reply("Invalid callback query.");
  }
});

// Game control commands
const commands = ["start", "stop", "speed_up", "slow_down", "reverse"];

commands.forEach((command) => {
  bot.command(command, async (ctx) => {
    const chatId = ctx.chat?.id.toString();

    if (!chatId) {
      ctx.reply("Unable to identify your chat ID.");
      return;
    }

    try {
      const userExists = await checkUser(chatId);

      if (!userExists) {
        ctx.reply(
          "You are not registered. Please click on 'Register' to start."
        );
        return;
      }

      const ws = userSessions[chatId];
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: command }));
        ctx.reply(`Command '${command}' sent.`);
      } else {
        ctx.reply("You are not connected to the game.");
      }
    } catch (error) {
      ctx.reply((error as Error).message);
    }
  });
});

// Helper function: Connect the user to the game
const connectToGame = (chatId: string, ctx: any) => {
  // Create a new WebSocket connection if it doesn't exist
  if (!userSessions[chatId]) {
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.on("open", () => {
      userSessions[chatId] = ws;
      ctx.reply("Connected to the game! Use the commands to control the game.");
    });

    ws.on("close", () => {
      delete userSessions[chatId];
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      ctx.reply("Failed to connect to the game. Please try again later.");
    });
  } else {
    ctx.reply("You are already connected to the game.");
  }
};

bot.launch();
