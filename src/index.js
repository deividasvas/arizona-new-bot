const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const { ChannelType, MessageMentions } = require("discord.js");
const parseUserId = require("./components/parseUserId");
const bot = new ExtendedClient();

process.on('uncaughtException', (err) => handleErrors(err, bot)); 
module.exports = { bot };