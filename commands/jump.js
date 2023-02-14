const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump to Song in queue")
    .addIntegerOption((option) =>
      option
        .setName("int")
        .setDescription("Enter queue number")
        .setRequired(true)
    ),
  async execute(interaction) {
    const queueNumber = interaction.options.getInteger("int");
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
      interaction.reply(`\`\`\`No Song To Play!\`\`\``);
      return;
    }
    musicConnection.jump(queueNumber);
    interaction.reply(`Jump to ${queueNumber}!`);
  },
};
