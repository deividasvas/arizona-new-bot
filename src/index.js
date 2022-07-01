const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const bot = new ExtendedClient();
// Обработка ошибок.
const errorHandle = (err) => handleErrors(err, bot);
process.on('uncaughtException', errorHandle);
process.on('unhandledRejection', errorHandle)
process.on('unhandledRejection', errorHandle);
module.exports = bot;

