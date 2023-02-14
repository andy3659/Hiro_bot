require("dotenv").config();
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const commands = [];
const commandsFile = fs
  .readdirSync(`./commands`)
  .filter((file) => file.endsWith(".js"));

for (const file of commandsFile) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

// For Deleting Commands

// rest
//   .get(Routes.applicationCommands(process.env.CLIENT_ID))
//   .then((data) => {
//     const promises = [];
//     for (const command of data) {
//       const deleteUrl = `${Routes.applicationCommands(process.env.CLIENT_ID)}/${
//         command.id
//       }`;
//       promises.push(rest.delete(deleteUrl));
//     }
//   })
//   .then(console.log("commands deleted!"));

// Register Commands
rest
  .put(
    Routes.applicationGuildCommands(
      process.env.CLIENT_ID,
      process.env.GUILD_ID
    ),
    { body: commands }
  )
  .then(() => console.log("Successfully registered application commands."))
  .catch(console.error);
