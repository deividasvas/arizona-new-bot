const { developers, prefix } = require('../configs/settings.js');
const handleErrors = require('../components/handleErrors.js');
const { MessageEmbed } = require('discord.js');

module.exports = async (bot, message) => {
    bot.modules.get('trigger').run(bot, message);
}