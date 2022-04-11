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
};

module.exports = {
  rolesId,
  channelsID: {
    events: "948675246825828471", // ивенты / #🔥│ивенты
    famGeneral: `948675246016299024`, // общение-семей
    famLogs: `948675244065947650`, // лог-семей
    testRoom: `948675243826888772`, // тест-комната
    logMonitoring: `948675244632195133`, // log-monitoring
    notifications: `960237241114951720`, // уведомления
    welcome: `948675245307469885`, // welcome
    moderationLog: `948675252353916945`, // 🔐-moderation-log
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
  maxCountImmunities: 2, // максимальное количество иммунитетов для модераторов
  maxCountWarns: 2, // максимальное количество предупреждений для модераторов
  prefix: "/",
  token: `OTYwMTA2MjU4NDg3MTgxMzYy.YklmoQ.U9M9r6TSmWx0kmM9hrWzfJ9ATM8`,
  applicationId: "932397605651091466",
  surpriseGuild: "948675243025764404",
  database: {
    url: `mongodb://localhost:27017/arizona_10`,
  },
  limitDeputyInFamilies: 5, // максимальное количество заместителей в семье
};
