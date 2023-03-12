const { Client, Collection } = require("discord.js");
const configuration = require("../../config.json");
const emojis = require("../../emojis.json");
class CustomClient extends Client {
  config = configuration;
  emojiList = emojis;
  commands = new Collection();
  musicConnection = new Collection();
}

module.exports = { CustomClient };
