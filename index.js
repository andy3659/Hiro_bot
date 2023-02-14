require("dotenv").config();
const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.commands = new Collection();
client.musicConnection = new Collection();

const commandsFile = fs
  .readdirSync("./commands")
  .filter((file) => file.endsWith(".js"));
for (const file of commandsFile) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

const eventsFile = fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"));
for (const file of eventsFile) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

client.login(process.env.DISCORD_TOKEN);
