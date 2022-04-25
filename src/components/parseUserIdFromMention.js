// функция для парсинга айдишника из <@id1234232> пинга

const {
  MessageMentions: { USERS_PATTERN },
} = require("discord.js");

const parseUserIdFromMention = (mention) => {
  // распарсиваем из пинга массив с разделёнными частями пинга
  const matches = mention.matchAll(/<@!?(\d{17,19})>/g).next().value;
  // если массива нет, то возвращаем ничего
  if (!matches) return;

  // получаем айдишник из списка
  const id = matches[1];

  return id;
}


module.exports = parseUserIdFromMention;