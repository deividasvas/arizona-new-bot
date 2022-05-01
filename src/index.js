const ExtendedClient = require("./structures/Client");
const handleErrors = require('./components/handleErrors');
const parseIdFromMention = require("./components/parseIdFromMention");
const bot = new ExtendedClient();

console.log(parseIdFromMention("я люблю когда <@904648434949169203> обмазывается маслом"))

process.on('uncaughtException', (err) => handleErrors(err, bot)); 
module.exports = { bot };