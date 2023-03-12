const { Events, ActivityType } = require("discord.js");
const { CustomClient } = require("../../structure/classes/CustomClient");
module.exports = {
  name: Events.ClientReady,
  once: true,
  /**
   *
   * @param {CustomClient} client
   */
  execute(client) {
    const { user } = client;
    user.setActivity({
      name: "Yuyu",
      type: ActivityType.Watching,
    });
    console.log(`Ready! Logged in as ${user.tag}`);
  },
};
