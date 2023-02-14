const { SlashCommandBuilder } = require("@discordjs/builders");
const pldl = require("play-dl");
const MusicConnection = require("../Util/music/musicConnection");
const musicEmbed = require("../Util/music/musicEmbed.js");
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play Music")
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Enter Song Title/Url")
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString("title");
    const client = interaction.client;
    const memberChannel = interaction.member.voice.channel;
    const clientChannel = interaction.guild.me.voice.channel;
    let musicConnection = client.musicConnection.get(interaction.guild.id);
    let song = {};
    await interaction.reply({
      embeds: [musicEmbed.message("Working on it...")],
    });

    // If user not in voice channel
    if (!memberChannel) {
      return interaction.editReply({
        embeds: [musicEmbed.message("Join Voice Channel First!")],
      });
    }
    // If member on different voice channel
    if (clientChannel && clientChannel != memberChannel) {
      return interaction.editReply({
        embeds: [musicEmbed.message("I'm on another channel")],
        ephemeral: true,
      });
    }
    // Validate youtube url
    if (input.startsWith("https") && pldl.yt_validate(input) === "video") {
      const songInfo = await pldl.video_basic_info(input);
      song = {
        title: songInfo.video_details.title,
        url: songInfo.video_details.url,
      };
    } else {
      //find song from title
      const videoFinder = await pldl.search(input, { limit: 1 });
      song = { title: videoFinder[0].title, url: videoFinder[0].url };
    }

    if (!musicConnection) {
      const connection = joinVoiceChannel({
        channelId: memberChannel.id,
        guildId: interaction.member.guild.id,
        adapterCreator: interaction.member.guild.voiceAdapterCreator,
      });
      musicConnection = new MusicConnection(
        connection,
        interaction.client,
        interaction.channelId
      );
      musicConnection.voiceConnection.on("error", console.warn);
      client.musicConnection.set(interaction.guildId, musicConnection);
    }

    // Make sure the connection is ready before processing the user's request
    try {
      await entersState(
        musicConnection.voiceConnection,
        VoiceConnectionStatus.Ready,
        20e3
      );
    } catch (error) {
      console.warn(error);
      await interaction.editReply({
        embeds: [
          musicEmbed.message(
            "Failed to join voice channel within 20 seconds, please try again later!"
          ),
        ],
      });
      return;
    }

    try {
      musicConnection.addSong(song);
      await interaction.editReply({
        embeds: [musicEmbed.titledMessage(`Added to queue`, `${song.title}`)],
      });
    } catch (error) {
      console.warn(error);
      await interaction.editReply(
        `\`\`\`Failed to play track, please try again later!\`\`\``
      );
    }
  },
};
