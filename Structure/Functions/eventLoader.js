const { CustomClient } = require("../classes/CustomClient");
const { loadFiles } = require("./fileLoader");

/**
 *
 * @param {CustomClient} client
 */
async function loadEvents(client) {
  let loaded = 0;
  let failed = 0;
  const files = await loadFiles("Events");
  files.forEach((file) => {
    const event = require(file);
    if (!event.name) return failed++;
    if (event.once)
      client.once(event.name, (...args) => event.execute(...args, client));
    else client.on(event.name, (...args) => event.execute(...args, client));
    loaded++;
  });
  if (loaded > 0) console.log(`Loaded ${loaded} events.`);
  if (failed > 0) console.log(`Failed to Load ${failed} events.`);
}
module.exports = { loadEvents };
