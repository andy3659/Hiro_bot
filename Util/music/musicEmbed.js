const { MessageEmbed } = require("discord.js");

module.exports = {
  message: function (message) {
    const embed = new MessageEmbed().setDescription(message);
    return embed;
  },

  titledMessage: function (title, message) {
    const embed = new MessageEmbed().setTitle(title).setDescription(message);
    return embed;
  },

  queueMessage: function (nowPlaying, queue, page) {
    const embed = new MessageEmbed()
      .setTitle(nowPlaying)
      .setDescription(queue)
      .addFooter(page);
    return embed;
  },
};
