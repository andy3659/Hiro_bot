const { Events, ChatInputCommandInteraction } = require("discord.js");
const { CustomClient } = require("../../structure/classes/CustomClient");
const { reply } = require("../../System/Reply");
module.exports = {
  name: Events.InteractionCreate,
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {CustomClient} client
   */
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guild, user } = interaction;

    if (!guild) return;

    const command = client.commands.get(commandName);

    if (!command) {
      return (
        reply(
          interaction,
          client.emojiList.cross,
          `The commands you're trying to execute doesn't exist!`
        ) && client.commands.delete(commandName)
      );
    }
    if (command.owner && !client.config.devs.includes(user.id)) {
      return reply(
        interaction,
        client.emojiList.cross,
        `This command is classified.`
      );
    }

    try {
      command.execute(interaction, client);
    } catch (error) {
      reply(
        interaction,
        client.emojiList.cross,
        `Something went wrong when trying to execute this command.`
      );
    }
  },
};
