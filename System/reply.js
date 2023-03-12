const { CommandInteraction, EmbedBuilder } = require("discord.js");

/**
 * @param {CommandInteraction} interaction
 * @param {String} emoji
 * @param {String} description
 * @param {Boolean} ephemeral
 */
function reply(interaction, emoji, description, ephemeral) {
  interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor("#0072ff")
        .setDescription(`\`${emoji}\` | ${description}`),
    ],
    ephemeral: ephemeral || true,
  });
}
module.exports = { reply };
