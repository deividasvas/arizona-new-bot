const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const parseIdFromMention = require("./components/parseIdFromMention");
const bot = new ExtendedClient();

process.on('uncaughtException', (err) => handleErrors(err, bot)); 
module.exports = { bot };