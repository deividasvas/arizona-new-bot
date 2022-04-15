const { default: mongoose } = require("mongoose");

// Коллекция в которой хранится информация о модераторах.
const ModeratorsSchema = new mongoose.Schema({
  discordId: String, // Discord ID модератора
  main: { // общая информация по выданным наказаниям модератора и некоторая информация по самому модератору
    roles: Number, // количество снятых ролей
    tickets: Number, // количество отвеченных тикетов
    kicks: Number, // количество киков
    bans: Number, // количество баннов
    mutes: Number, // количество мутов
    goodAnswers: Number, // хорошие оценки за тикеты
    toxicAnswers: Number, // плохие оценки за тикеты
    balls: Number, // общие баллы
    coefficient: Number, // коэффицент Xn баллов.
    immunities: Number, // количество иммунитетов модератора. СТАВИТЬ МИНИМУМ 1, ИБО НА ЭТО УМНОЖАЕТСЯ КОЛИЧЕСТВО БАЛЛОВ ПРИ ВЫДАЧЕ НАКАЗАНИЯ!!!!
  },
  week: { // недельная информация по выданным наказания модератора
    roles: Number, // количество снятых ролей
    tickets: Number, // количество отвеченных тикетов
    kicks: Number, // количество киков
    bans: Number, // количество баннов
    mutes: Number, // количество мутов
    goodAnswers: Number, // хорошие оценки за тикеты
    toxicAnswers: Number, // плохие оценки за тикеты
    balls: Number, // недельные баллы
  },
  warns: [ // выговоры / предупреждения
      {
          group: String, // Группа выговоров или предов. rebuke - выговор / warn - предупреждение
          reason: String, // причина выговора, предупреждения
          initiatorId: String, // ID того кто выдал выговор / пред
      }
    ],
});

module.exports = new mongoose.model("moderators", ModeratorsSchema); // коллекция с наказаниями
