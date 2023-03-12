require("dotenv").config();
const { GatewayIntentBits, Partials } = require("discord.js");
const { CustomClient } = require("./Structure/classes/CustomClient");
const { loadEvents } = require("./Structure/Functions/eventLoader");

const client = new CustomClient({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

loadEvents(client);

client.login(process.env.DISCORD_TOKEN);
