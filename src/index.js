const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const bot = new ExtendedClient();
process.on('uncaughtException', (err) => handleErrors(err, bot));
module.exports = { bot };