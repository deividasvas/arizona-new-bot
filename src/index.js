const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const { restartDeposits } = require("./modules/coins");
const bot = new ExtendedClient();

setTimeout(() => {
	restartDeposits(bot);
}, 3000);


// Обработка ошибок.
const errorHandle = (err) => handleErrors(err, bot);
process.on('uncaughtException', errorHandle);
process.on('unhandledRejection', errorHandle)
process.on('unhandledRejection', errorHandle);
module.exports = bot;