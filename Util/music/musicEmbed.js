const { EmbedBuilder } = require("discord.js");

module.exports = {
  message: function (message) {
    const embed = new EmbedBuilder().setDescription(message);
    return embed;
  },

  titledMessage: function (title, message) {
    const embed = new EmbedBuilder().setTitle(title).setDescription(message);
    return embed;
  },

  queueMessage: function (nowPlaying, queue, page) {
    const embed = new EmbedBuilder()
      .setTitle(nowPlaying)
      .setDescription(queue)
      .addFooter(page);
    return embed;
  },
};
