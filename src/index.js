const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const getJuniperBotLevel = require("./components/getJuniperBotLevel");
const bot = new ExtendedClient();
console.time();
getJuniperBotLevel(bot, `904648434949169203`, `603603887668330496`).then(lvl => {
	console.log(lvl);
	console.timeEnd();
});

const errorHandle = (err) => handleErrors(err, bot);
process.on('uncaughtException', errorHandle);
process.on('unhandledRejection', errorHandle)
process.on('unhandledRejection', errorHandle);
module.exports = bot;