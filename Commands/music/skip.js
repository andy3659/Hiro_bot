const { SlashCommandBuilder } = require("@discordjs/builders");

const musicEmbed = require("../../Util/music/musicEmbed.js");
module.exports = {
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip Song"),
  async execute(interaction) {
    const musicConnection = interaction.client.musicConnection.get(
      interaction.guild.id
    );

    const memberChannel = interaction.member.voice.channel;
    const clientChannel = interaction.guild.members.me.voice.channel;
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
    musicConnection.audioPlayer.stop();
    interaction.reply({ embeds: [musicEmbed.message(`Skipped!`)] });
  },
};
