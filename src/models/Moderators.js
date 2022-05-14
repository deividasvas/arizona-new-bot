const { default: mongoose } = require("mongoose");

// Коллекция в которой хранится информация о модераторах.
const ModeratorsSchema = new mongoose.Schema({
  userId: String, // Discord ID модератора
  guildId: String, // ID сервера на котором пользователь является модератором
  main: { // общая информация по выданным наказаниям модератора и некоторая информация по самому модератору
    roles: Number, // количество отказанных/одобренных ролей
    tickets: Number, // количество отвеченных тикетов
    kicks: Number, // количество киков
    bans: Number, // количество баннов
    mutes: Number, // количество мутов
    goodAnswers: Number, // хорошие ответы в тикетах
    toxicAnswers: Number, // токсичные ответы в тикетах
    balls: Number, // общие баллы
    coefficient: Number, // коэффицент Xn баллов.
    immunities: Number, // количество иммунитетов модератора. СТАВИТЬ МИНИМУМ 1, ИБО НА ЭТО УМНОЖАЕТСЯ КОЛИЧЕСТВО БАЛЛОВ ПРИ ВЫДАЧЕ НАКАЗАНИЯ!!!!
    removedRole: Number, // количество выданных ролей
  },
  week: { // недельная информация по выданным наказания модератора
    roles: Number, // количество отказанных/одобренных ролей
    tickets: Number, // количество отвеченных тикетов
    kicks: Number, // количество киков
    bans: Number, // количество баннов
    mutes: Number, // количество мутов
    goodAnswers: Number, // хорошие ответы в тикетах
    toxicAnswers: Number, // токсичные ответы в тикетах
    balls: Number, // недельные баллы
    removedRole: Number, // количество снятых ролей
  },
  warns: [ // выговоры / предупреждения
      {
          group: String, // Группа выговоров или предов. rebuke - выговор / warn - предупреждение
          reason: String, // причина выговора, предупреждения
          initiatorId: String, // ID того кто выдал выговор / пред
      }
    ],
  task: { // задание на снятие предупреждения
    status: String, // active / no
    mutes: Number, // количество мутов для снятия предупреждения
    kicks: Number, // количество киков для снятия предупреждения
    bans: Number, // количество банов для снятия предупреждения
    tickets: Number, // количество тикетов для снятия предупреждения
  },
  neactive: { // неактив модератора.
    dateEnd: Date, // дата конца неактива
    givedId: String, // айди того кто выдал неактив
    active: Boolean, // активен ли неактив
    reason: String, // причина неактива
  }
});

module.exports = new mongoose.model("moderators", ModeratorsSchema); // коллекция с наказаниями
