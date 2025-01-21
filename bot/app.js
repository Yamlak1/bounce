const { Telegraf } = require("telegraf");
const { commands } = require("./src/commands");

const botToken = "7111298714:AAFbTvF2DObt9Shetl7uzYRGXreSUomoXks";
const bot = new Telegraf(botToken);

const PORT = 3000;

// Set bot commands
bot.telegram.setMyCommands([{ command: "start", description: "Start" }]);

// Use the commands function
commands(bot);

// Launch the bot
bot.launch();

console.log("Bot is running...");
