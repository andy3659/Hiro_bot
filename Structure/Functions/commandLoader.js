const { CustomClient } = require("../classes/CustomClient");
const { loadFiles } = require("./fileLoader");
/**
 *
 * @param {CustomClient} client
 */
async function loadCommands(client) {
  const { commands, config, application, guilds } = client;

  commands.clear();

  let loaded = 0;
  let failed = 0;
  let commandsArray = [];

  const files = await loadFiles("Commands");

  files.forEach((file) => {
    const command = require(file);
    if (!command.data.name) return failed++;
    commands.set(command.data.name, command);
    commandsArray.push(command.data.toJSON());
    loaded++;
  });

  if (loaded > 0) console.log(`Loaded ${loaded} commands.`);
  if (failed > 0) console.log(`Failed to load ${failed} commands.`);

  if (config.global == true) {
    application.commands.set(commandsArray);
  } else {
    const guild = guilds.cache.get(config.devGuildId);
    if (!guild) return;
    guild.commands.set(commandsArray);
  }
}
module.exports = { loadCommands };
