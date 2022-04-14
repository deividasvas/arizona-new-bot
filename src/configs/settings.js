const { ApplicationCommandOptionType, MessageMentions } = require("discord.js");
const rolesId = {
  // айдишники ролей
  techSection: `948675243248062523`, // Технический отдел
  discordMaster: `948675243327770678`, // Discord Master
  juniorDiscordMaster: `948675243264868413`, // Jr. Discord Master
  everyone: `948675243025764404`, // Все пользователи
  events: `948675243038363698`,
  verify: `948675243025764405`, // проверенный
  fams: `948675243134828606`, // ⬇➖ Семьи ➖⬇
  mainAdmin: `948675243327770682`, // Главный администратор
  deputyMainAdmin: `948675243327770681`, // Заместитель главного администратора
  curator: `948675243327770679`, // Куратор
  juniorAdmins: `948675243281641521`, // Мл. Администратор [1-2 ур]
  adminsThreeLVL: `948675243298414592`, // Администратор 3 ур.
  adminsFourLVL: `948675243298414594`, // Администратор 4 ур.
  adviceAdministration: `948675243264868412`, // Совет администрации
  curatorModeration: `948675243248062520`, // куратор модерации
  moderator: `948675243248062519`, // модератор
  juniorModerator: `948675243248062518`, // мл.модератор
  muted: `948675243248062521`, // ✖ Muted ✖
  spectatorGov: `948675243281641517`, // Следящий ЦА
  spectatorPolice: `948675243281641516`, // Следящий МЮ
  spectatorArmy: `948675243281641515`, // Следящий МО
  spectatorHealth: `948675243281641514`, // Следящий МЗ
  spectatorRadio: `948675243281641513`, // Следящий СМИ
  mainSpectatorsState: `948675243327770674`, // Руководство ГОС
  spectatorState: `948675243310973003`, // Следящий ГОС
  bots: `948675243327770677`, // Боты
  deputiesFractions: `948675243235475459`, // Заместители фракции
  leadersFractions: `948675243235475460`, // Лидеры фракции
  ministers: `948675243235475461`, // Министры
};

module.exports = {
  rolesId,
  channelsId: {
    events: "948675246825828471", // ивенты / #🔥│ивенты
    famGeneral: `948675246016299024`, // общение-семей
    famLogs: `948675244065947650`, // лог-семей
    testRoom: `948675243826888772`, // тест-комната
    logMonitoring: `948675244632195133`, // log-monitoring
    notifications: `960237241114951720`, // уведомления
    welcome: `948675245307469885`, // welcome
    moderationLog: `948675252353916945`, // 🔐-moderation-log
    curators: `948675243579441175`, // кураторская
    moderation: `948675243579441176`, // модераторы
    punishModeratorsLog: `948675243579441178`, // система-выговоров-модераторам
    discordMasters: `948675243579441173`, // дискорд-мастера
    administrationCouncil: `948675243579441174`, // совет-администрации-дискорда
    punishLeadership: `948675243826888766`, // нарушения руководящего состава
    support: `948675245043220487`, // 🔔│support
  },
  categories: {
    fams: "948675246016299023", // семейные роли
  },
  saveError: {
    logChannel: `948675243826888772`, // * Канал куда логируем ошибки
  },
  developers: [
    "316154352760782849", // * Yuri Lance
    "904648434949169203", // * Deivid Brown
    "691701692256878632", // * Michell Mahonya
  ],
  fullPermissionCommandsRolesId: [
    // Список ролей у которых есть доступ к АБСОЛЮТНО всем слэш командам.
    rolesId.mainAdmin, // ГА
    rolesId.deputyMainAdmin, // ЗГА
    rolesId.curator, // Куратор
    rolesId.discordMaster, // Дискорд Мастер
    rolesId.juniorDiscordMaster, // Junior дискорд мастер
  ],
  typesArguments: [
    // типы аргументов. Сделано для messageCreate нормального показа FAQ аргумент типов
    {
      type: ApplicationCommandOptionType.Number,
      value: `Число`,
      validator(val) {
        return typeof val === "number" || isNaN(val);
      },
    },
    {
      type: ApplicationCommandOptionType.User,
      value: `ID пользователя | упоминание пользователя`,
      validator(val, guild) {
        return Boolean(
          guild.members.cache.get(val) ||
            MessageMentions.USERS_PATTERN.test(val)
        );
      },
    },
    {
      type: ApplicationCommandOptionType.Channel,
      value: `ID канала | упоминание канала`,
      validator(val, guild) {
        return Boolean(
          guild.channels.cache.get(val) ||
            MessageMentions.CHANNELS_PATTERN.test(val)
        );
      },
    },
    {
      type: ApplicationCommandOptionType.Role,
      value: `ID роли | упоминание роли`,
      validator(val, guild) {
        return Boolean(
          guild.roles.cache.get(val) ||
            MessageMentions.ROLES_PATTERN.test(val)
        );
      },
    },
    {
      type: ApplicationCommandOptionType.Boolean,
      value: `True | False`,
      validator(val) {
        return val === true || val === false;
      },
    },
    {
      type: ApplicationCommandOptionType.String,
      value: `Строка`,
      validator(val) {
        return typeof val === "string";
      },
    },
  ],
  whiteListRoles: [
    // белый список ролей по отношению к наказаниям
    rolesId.discordMaster, // дискорд мастер
    rolesId.juniorDiscordMaster, // младший дискорд мастер
    rolesId.mainAdmin, // ГА
    rolesId.deputyMainAdmin, // ЗГА
    rolesId.curator, // кураторы
    rolesId.adviceAdministration, // совет администрации дискорда
    rolesId.curatorModeration, // куратор модерации
    rolesId.moderator, // старший модератор
    rolesId.adminsFourLVL, // админ 4 уровня
    rolesId.adminsThreeLVL, // админ 3 уровня
    rolesId.juniorAdmins, // хелпер 1-2 уровня
    rolesId.juniorModerator, // младший модератор
  ],
  fromPostToPostList: [
    // массив с должностями. Должность с которой понижают, и должность на которую понижают
    {
      fromRoleId: rolesId.adviceAdministration, // совет администрации
      toRoleId: rolesId.curatorModeration, // понижают до куратора модерации
    },
    {
      fromRoleId: rolesId.curatorModeration, // куратор модерации
      toRoleId: rolesId.moderator, // понижают до старшего модератора
    },
    {
      fromRoleId: rolesId.moderator, // куратор модерации
      toRoleId: rolesId.juniorModerator, // понижают до младшего модератора
    },
  ],
  maxCountImmunities: 2, // максимальное количество иммунитетов для модераторов
  maxCountWarns: 2, // максимальное количество предупреждений для модераторов
  maxCountRebukes: 3, // максимальное количество выговоров для модераторов
  prefix: "/",
  token: `OTYzODc2NzU0OTUzNDk0NTU4.YlceLg.qf_KGNhq5ieZdITICp2SEZmss1k`,
  applicationId: "932397605651091466",
  surpriseGuild: "948675243025764404",
  database: {
    url: `mongodb://localhost:27017/arizona_10`,
  },
  limitDeputyInFamilies: 5, // максимальное количество заместителей в семье
};
