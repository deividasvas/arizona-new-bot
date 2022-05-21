const { default: mongoose } = require("mongoose");
// Коллекция эмбедов которые в процессе редактирования от инфомейкеров
const InfoMakerEmbed = new mongoose.Schema({
  infoMakerId: String, // айдишник информейкера
  guildId: String, // айдишник сервера на котором всё происходит
  title: String, // заголовок эмбеда
  description: String, // описание эмбеда
  color: String, // цвет эмбеда
  timestamp: String, // время отправки эмбеда
  imageUrl: String, // картинка эмбеда
  footer: String, // текст футера эмьеда
  imageFooter: String, // картинка футера
  authorName: String, // имя автора
  authorLink: String, // ссылка на автора
  authorImageLink: String, // картинка автора
  urlTitle: String, // ссылка на заголовок
  fields: [
    {
      key: String,
      value: String,
    },
  ],
});

module.exports = mongoose.model("infomaker-embeds", InfoMakerEmbed);
