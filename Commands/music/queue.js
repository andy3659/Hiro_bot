const { SlashCommandBuilder } = require("@discordjs/builders");
const musicEmbed = require("../../Util/music/musicEmbed.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show songs in queue!"),
  async execute(interaction) {
    const musicConnection = interaction.client.musicConnection.get(
      interaction.guild.id
    );

    if (!musicConnection) {
      interaction.reply({
        embeds: [musicEmbed.message(`Add some musics first!`)],
      });
      return;
    }

    if (musicConnection.queue.length < 1) {
      interaction.reply({
        embeds: [musicEmbed.titledMessage("Queue", `There's nothing here...`)],
      });
      return;
    }

    let queueText = "";
    let queueMessage = null;
    const queue = musicConnection.queue;

    for (const [index, song] of queue.entries()) {
      queueText += index + 1 + ". " + song.title + "\n";
    }
    if (musicConnection.nowPlaying > musicConnection.queue.length - 1) {
      queueMessage = musicEmbed.titledMessage(`Queue`, queueText);
    } else {
      queueMessage = musicEmbed.titledMessage(
        `Now Playing ${musicConnection.nowPlaying + 1}. ${
          queue[musicConnection.nowPlaying].title
        }`,
        queueText
      );
    }

    interaction.reply({ embeds: [queueMessage] });
  },
};
