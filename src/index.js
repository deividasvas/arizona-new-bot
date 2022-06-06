const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const unban = require('./components/unban')
const bot = new ExtendedClient();
const log = require('./components/log');

// Обработка ошибок.
const errorHandle = (err) => handleErrors(err, bot);
process.on('uncaughtException', errorHandle);
process.on('unhandledRejection', errorHandle)
process.on('unhandledRejection', errorHandle);
module.exports = bot;