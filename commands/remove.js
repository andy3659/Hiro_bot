const { SlashCommandBuilder } = require("@discordjs/builders");
const musicEmbed = require("../Util/music/musicEmbed.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove song with index")
    .addIntegerOption((option) =>
      option
        .setName("index")
        .setDescription("Enter queue number")
        .setRequired(true)
    ),
  async execute(interaction) {
    const queueNumber = interaction.options.getInteger("index");
    const musicConnection = interaction.client.musicConnection.get(
      interaction.guild.id
    );
    const memberChannel = interaction.member.voice.channel;
    const clientChannel = interaction.guild.me.voice.channel;
    // If user not in voice channel
    if (!memberChannel) {
      return interaction.reply({
        content: `\`\`\`join voice channel first!\`\`\``,
        ephemeral: true,
      });
    }
    // If member on different voice channel
    if (clientChannel && clientChannel != memberChannel) {
      return interaction.reply({
        content: `\`\`\`I'm on other channel!\`\`\``,
        ephemeral: true,
      });
    }

    if (!musicConnection) {
      interaction.reply({
        content: "you cant use this command!",
        ephemeral: true,
      });
      return;
    }

    if (queueNumber > musicConnection.queue.length || queueNumber < 1) {
      interaction.reply({ embeds: [musicEmbed.message("No Song To Remove~")] });
      return;
    }

    const songTitle = musicConnection.queue[queueNumber - 1].title;
    musicConnection.remove(queueNumber);
    interaction.reply({
      embeds: [musicEmbed.message(`Removed ${songTitle}!`)],
    });
  },
};
