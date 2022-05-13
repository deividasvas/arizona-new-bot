const { ApplicationCommandOptionType, MessageMentions } = require("discord.js");
const rolesId = {
  // айдишники ролей
  "948675243025764404": {
    // Игрок мафии
    mafia: `948675243038363699`,
    // 🔒Support Blocked🔒
    supportBlock: `948675243248062522`,
    // Технический отдел
    techSection: `948675243248062523`,
    // Discord Master
    discordMaster: `948675243327770678`,
    // Jr. Discord Master
    juniorDiscordMaster: `948675243264868413`,
    // Все пользователи
    everyone: `948675243025764404`,
    // 🏖 Неактив 🏖
    neactive: `948675243248062517`,
    // Event's
    events: `948675243038363698`,
    // проверенный
    verify: `948675243025764405`,
    // ⬇➖ Семьи ➖⬇
    fams: `948675243134828606`,
    // Главный администратор
    mainAdmin: `948675243327770682`,
    // Заместитель главного администратора
    deputyMainAdmin: `948675243327770681`,
    // Куратор
    curator: `948675243327770679`,
    // Мл. Администратор [1-2 ур]
    juniorAdmins: `948675243281641521`,
    // Администратор 3 ур.
    adminsThreeLVL: `948675243298414592`,
    // Администратор 4 ур.
    adminsFourLVL: `948675243298414594`,
    // Совет администрации
    adviceAdministration: `948675243264868412`,
    // куратор модерации
    curatorModeration: `948675243248062520`,
    // модератор
    moderator: `948675243248062519`,
    // мл.модератор
    juniorModerator: `948675243248062518`,
    // ✖ Muted ✖
    muted: `948675243248062521`,
    // Следящий ЦА
    spectatorGov: `948675243281641517`,
    // Следящий МЮ
    spectatorPolice: `948675243281641516`,
    // Следящий МО
    spectatorArmy: `948675243281641515`,
    // Следящий МЗ
    spectatorHealth: `948675243281641514`,
    // Следящий СМИ
    spectatorRadio: `948675243281641513`,
    // Руководство ГОС
    mainSpectatorsState: `948675243327770674`,
    // Следящий ГОС
    spectatorState: `948675243310973003`,
    // Боты
    bots: `948675243327770677`,
    // Заместители фракции
    deputiesFractions: `948675243235475459`,
    // Лидеры фракции
    leadersFractions: `948675243235475460`,
    // Министры
    ministers: `948675243235475461`,
    // Infomaker
    infoMaker: `948675243235475465`,
    // Chief news
    chiefInfoMaker: `948675243248062516`,
    // Сотрудник SWAT
    swat: `948675243172565001`,
    // Сотрудник LSPD
    lspd: `948675243185152051`,
    // Сотрудник LVMPD
    lvmpd: `948675243172565000`,
    // Сотрудник RCSD
    rcsd: `948675243172564999`,
    // Сотрудник FBI
    fbi: `948675243185152053`,
    // Академист FBI
    fbi_academy: `948675243185152052`,
    // ★. Роль, которая даёт доступ людям к рассмотрению анкет.
    star: `973620618673131650`,
    // Кандидат на собеседование
    colloquyCandidate: `948675243025764407`
  }
};

module.exports = {
  // Айдишники ролей
  rolesId,

  // Каналы в которые при входе создаётся приват.
  channelsForCreatePrivate: (guildChannelsId, guildRolesId) => {
    return [{
      // Айди канала при заходе в который создаётся приват.
      id: guildChannelsId.createPrivate,
      // Эмодзи который будет указан в названии канала.
      emoji: `👥`,
      // Доступен ли канал всем пользователям
      everyone: true,
      // Настройки прав для обычных пользователей привата. (ВЛАДЕЛЕЦ И EVERYONE редактируются в createPrivate)
      permissionsForUsers: [
        {
          id: guildRolesId.juniorDiscordMaster,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels',],
          deny: ['Administrator']
        },
      ]
    },
    {
      // Айди канала при заходе в который создаётся приват.
      id: guildChannelsId.createPatrolPrivate,
      // Эмодзи который будет указан в названии канала.
      emoji: `🚓`,
      // Доступен ли канал всем пользователям
      everyone: false,
      // Настройки прав для обычных пользователей привата. (ВЛАДЕЛЕЦ И EVERYONE редактируются в createPrivate)
      permissionsForUsers: [
        {
          id: guildRolesId.juniorDiscordMaster,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels',],
          deny: ['Administrator']
        },
        {
          id: guildRolesId.swat,
          allow: ['Speak', 'ViewChannel', 'Connect'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.lspd,
          allow: ['Speak', 'ViewChannel', 'Connect'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.lvmpd,
          allow: ['Speak', 'ViewChannel', 'Connect'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.rcsd,
          allow: ['Speak', 'ViewChannel', 'Connect'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.fbi,
          allow: ['Speak', 'ViewChannel', 'Connect'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.fbi_academy,
          allow: ['Speak', 'ViewChannel', 'Connect'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.spectatorPolice,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.spectatorState,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers'],
          deny: ['ManageChannels']
        },
        {
          id: guildRolesId.mainSpectatorsState,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers'],
          deny: ['ManageChannels']
        },
      ]
    },
    {
      // Айди канала при заходе в который создаётся приват.
      id: guildChannelsId.createFilmPrivate,
      // Эмодзи который будет указан в названии канала.
      emoji: `🍿`,
      // Доступен ли канал всем пользователям
      everyone: true,
      // Настройки прав для обычных пользователей привата. (ВЛАДЕЛЕЦ И EVERYONE редактируются в createPrivate)
      permissionsForUsers: [
        {
          id: guildRolesId.juniorDiscordMaster,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels',],
          deny: ['Administrator']
        },
      ]
    },
    {
      // Айди канала при заходе в который создаётся приват.
      id: guildChannelsId.createAnimePrivate,
      // Эмодзи который будет указан в названии канала.
      emoji: `🥢`,
      // Доступен ли канал всем пользователям
      everyone: true,
      // Настройки прав для обычных пользователей привата. (ВЛАДЕЛЕЦ И EVERYONE редактируются в createPrivate)
      permissionsForUsers: [
        {
          id: guildRolesId.juniorDiscordMaster,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels',],
          deny: ['Administrator']
        },
      ]
    },
    {
      // Айди канала при заходе в который создаётся приват.
      id: guildChannelsId.createMafiaPrivate,
      // Эмодзи который будет указан в названии канала.
      emoji: `📍`,
      // Доступен ли канал всем пользователям
      everyone: true,
      // Настройки прав для обычных пользователей привата. (ВЛАДЕЛЕЦ И EVERYONE редактируются в createPrivate)
      permissionsForUsers: [
        {
          id: guildRolesId.juniorDiscordMaster,
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels',],
          deny: ['Administrator']
        },
      ]
    },
  ]},
  // Настройки саппорта
  supportSettings: {
    // Начало названия тикета
    ticketNameStartsWith: "ticket",
    // Айди ролей, которые будут отвечать на тикеты. (Пинг этих ролей происходит в тикете)
    getModeratorsPermissionRolesId: (rolesId) => [
        rolesId.moderator,
        rolesId.juniorModerator,
    ],
    // Айди ролей, которые имеют ПОЛНЫЙ доступ к тикетам.
    // Даже к тому, чтобы закрыть его не являясь отвечающим на него.
    getFullPermissionRolesId: (rolesId) => [
        rolesId.mainAdmin,
        rolesId.deputyMainAdmin,
        rolesId.curator,
        rolesId.discordMaster,
        rolesId.juniorModerator,
        rolesId.adviceAdministration,
    ],
  },
  // Категории в которых находятся приваты
  categoriesPrivatesId: categories => [
    // Приватный блок
    categories.privatesBlock,
    // Фильмы/аниме
    categories.movies,
    // Блок мафии
    categories.blockMafia,
    // Патрули
    categories.patrol,
  ],
  channelsId: {
    "948675243025764404": {
      // теги-организации
      rolesForms: `972849565873094696`,
      // 🏖│лог-неактивов
      neactiveLog: `948675243826888765`,
      // ивенты / #🔥│ивенты
      events: "948675246825828471",
      // общение-семей
      famGeneral: `948675246016299024`,
      // лог-семей
      famLogs: `948675244065947650`,
      // тест-комната
      testRoom: `948675243826888772`,
      // правила-дискорда
      rules: `948675245043220484`,
      // log-monitoring
      logMonitoring: `948675244632195133`,
      // онлайн-фракции
      onlineFraction: `948675245043220485`,
      // уведомления
      notifications: `960237241114951720`,
      // welcome
      welcome: `948675245307469885`,
      // 🔐-moderation-log
      moderationLog: `948675252353916945`,
      // кураторская
      curators: `948675243579441175`,
      // модераторы
      moderation: `948675243579441176`,
      // система-выговоров-модераторам
      punishModeratorsLog: `948675243579441178`,
      // дискорд-мастера
      discordMasters: `948675243579441173`,
      // совет-администрации-дискорда
      administrationCouncil: `948675243579441174`,
      // нарушения руководящего состава
      punishLeadership: `948675243826888766`,
      // 🔔│support
      support: `948675245043220487`,
      // роли-баны
      rolesAndBans: `948675252697825376`,
      // запрос-ролей
      requestRoles: `948675245307469890`,
      // лог-покупок-модераторов
      logBuysModerators: `948675243579441179`,
      // инфомейкеры
      infomakers: `948675246825828468`,
      // 🧲・Создать приват
      createPrivate: `972913317196746854`,
      // управление приватом
      managePrivate: `948675245601095722`,
      // 🔊-голосовые
      voicesLog: `948675252697825375`,
      // Патруль(канал создания привата патруля)
      createPatrolPrivate: `948675249963139170`,
      // Создать канал фильма
      createFilmPrivate: `948675246016299021`,
      // Создать канал Аниме
      createAnimePrivate: `948675246016299022`,
      // Создать комнату мафии
      createMafiaPrivate: `948675245798211701`,
      // управление
      managePrivate: `948675245601095722`,
      // первые шаги
      firstSteps: `948675245043220483`,
      // discord-info
      discordInfo: `973281650546995200`,
      // теги-организации
      tagsFractions: `972849565873094696`,
      // руководство гос
      mainGovManagers: `948675247924727833`,
      // главные следящие
      mainManagersGovStructures: `948675247924727834`,
      // лог выдачи предов
      logGivesWarnsLeaders: `948675247924727835`,
      // следящие гос
      spectatorsStructures: `948675247924727836`,
      // лог выдачи страйков
      logGivesStrikesSpectators: `948675248205754378`,
      // нововведения по структурам
      updatesStructures: `948675248205754385`,
      // еженедельный отчёт
      everyWeekReport: `948675248205754386`,
      // одобренные-анкеты
      acceptedQuestionnaire: `948675248419651654`,
      // отказанные-анкеты
      dontAcceptedQuestionnaire: `948675248419651655`,
      // отправка-анкет
      sendQuestionnaire: `948675248419651656`,
      // проверяющие-жалобы
      checkersReportsAdmins: `948675248205754387`,
      // анкеты на рассмотрение
      questionnairesForCheck: `948675248419651657`,
      // следящие-ЦА
      spectatorGov: `948675248721625089`,
      // следящие-МЮ
      spectatorPolice: `948675249518571600`,
      // следящие-МО
      spectatorArmy: `948675250151903232`,
      // следящие-МЗ
      spectatorHealth: `948675250651021324`,
      // следящие-СМИ
      spectatorRadio: `948675251380822128`,
      // совершенно секретно
      verySecret: `973584583163514880`,
      // сообщения
      messagesLog: `948675252697825371`,
      // Комната ожидания собеседования
      waitingColloquy: `948675247924727831`,
      // Собеседование 1
      colloquy1: `948675247433977894`,
      // Собеседование 2
      colloquy2: `948675247433977895`,
      // Собеседование 3
      colloquy3: `948675247924727828`,
      // Собеседование 4
      colloquy4: `948675247924727829`,
      // Собеседование 5
      colloquy5: `948675247924727830`,
      // 📃-логи-тикетов
      ticketsLog: `948675252697825378`,
    },
  },

  // Категории
  categories: {
    "948675243025764404": {
      // Семейные роли
      fams: "948675246016299023",
      // Фильмы/аниме
      movies: `948675246016299019`,
      // Модерация
      moders: `603606059084546094`,
      // Корзина
      basketTickets: `948675252089667663`,
      // Персональные роли категория
      peopleRoles: `948675243101265948`,
      // Приватный блок
      privatesBlock: `948675245601095721`,
      // Блок мафии
      blockMafia: `948675245798211698`,
      // Автоматические каналы(патрули)
      patrol: `948675249963139168`,
      // Администрация
      administration: `948675244409901093`,
      // Руководство сервера
      managersServers: `948675244229533716`,
      // Структура хелперства
      helpers: `948675244841906236`,
      // Стримы сюрпрайз
      youtube: `948675252089667659`,
      // Активные тикеты
      activeTickets: `948675244065947657`,
      // Тикеты на рассмотрении
      holdTickets: `948675244065947655`,
    }
  },
  saveError: {
    // * Канал куда логируем ошибки
    "948675243025764404": {
      logChannel: `948675243826888772`,
    }
  },
  developers: [
    "316154352760782849", // * Yuri Lance
    "904648434949169203", // * Deivid Brown
    "691701692256878632", // * Michell Mahonya
  ],
  fullPermissionCommandsRolesId: {
    // Список ролей у которых есть доступ к АБСОЛЮТНО всем слэш командам.
    "948675243025764404": [
      // ГА
      rolesId.mainAdmin,
      // ЗГА
      rolesId.deputyMainAdmin,
      // Куратор
      rolesId.curator,
      // Дискорд Мастер
      rolesId.discordMaster,
      // Junior дискорд мастер
      rolesId.juniorDiscordMaster,
    ]
  },
  typesArguments: [
    // типы аргументов. Сделано для messageCreate нормального показа FAQ аргумент типов
    {
      type: ApplicationCommandOptionType.Number,
      value: `Число`,
      validator(val) {
        return !isNaN(val);
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
            guild.roles.cache.get(val) || MessageMentions.ROLES_PATTERN.test(val)
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
  whiteListRoles: {
    // белый список ролей по отношению к наказаниям
    "948675243025764404": [
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
    ]
  },
  // Массив с должностями. Должность с которой понижают, и должность на которую понижают
  fromPostToPostList: {
    "948675243025764404": [
      {
        // совет администрации
        fromRoleId: rolesId.adviceAdministration,
        // понижают до куратора модерации
        toRoleId: rolesId.curatorModeration,
      },
      {
        // куратор модерации
        fromRoleId: rolesId.curatorModeration,
        // понижают до старшего модератора
        toRoleId: rolesId.moderator,
      },
      {
        // куратор модерации
        fromRoleId: rolesId.moderator,
        // понижают до младшего модератора
        toRoleId: rolesId.juniorModerator,
      },
    ]

  },
  // максимальное количество иммунитетов для модераторов
  maxCountImmunities: 2,
  // максимальное количество предупреждений для модераторов
  maxCountWarns: 2,
  // максимальное количество выговоров для модераторов
  maxCountRebukes: 3,
  // префикс для использования бота
  prefix: "/",
  // токен бота
  token: "OTYzODc2NzU0OTUzNDk0NTU4.YlceLg.QmLQ10ZLbE1FlU-yBCYV_bw00Rk",
  // настройка базы данных
  database: {
    // URL для подключения к бд
    url: `mongodb://localhost:27017/arizona_10`,
  },
// Расценки за одно наказание в баллах. БЕЗ УЧЕТА КОЭФФИЦЕНТА!!
  rates: {
    // Расценка за один бан
    ban: 1,
    // Расценка за одну снятую роль
    role: 0.45,
    // Расценка за один отвеченный тикет
    ticket: 0.55,
    // Расценка за один выданный мут
    mute: 0.55,
    // Расценка за один выданный кик
    kick: 0.50,
  },
  // максимальное количество заместителей в семье
  limitDeputyInFamilies: 5,
  // Игнорируемые каналы при обновлении/удаление сообщения.
  messagesIgnoredChannelsId: (guildChannelsId) => [
    // дискорд мастера
    guildChannelsId.discordMasters,
    // руководство гос
    guildChannelsId.mainGovManagers,
    // главные следящие
    guildChannelsId.mainManagersGovStructures,
    // лог выдачи предов
    guildChannelsId.logGivesWarnsLeaders,
    // следящие гос
    guildChannelsId.spectatorsStructures,
    // лог выдачи страйков
    guildChannelsId.logGivesStrikesSpectators,
    // нововведение по структурам
    guildChannelsId.updatesStructures,
    // еженедельный отчёт
    guildChannelsId.everyWeekReport,
    // одобренные анкеты
    guildChannelsId.acceptedQuestionnaire,
    // отказанные анкеты
    guildChannelsId.dontAcceptedQuestionnaire,
    // отправка-анкет
    guildChannelsId.sendQuestionnaire,
    // проверяющие жалобы
    guildChannelsId.checkersReportsAdmins,
    // анкеты на рассмотрений
    guildChannelsId.questionnairesForCheck,
    // кураторская
    guildChannelsId.curators,
    // совет администрации дискорда
    guildChannelsId.adviceAdministration,
    // совершенно-секретно
    guildChannelsId.verySecret
  ],
  messagesIgnoredCategoriesId: (guildCategoriesId) => [
    // Администрация
    guildCategoriesId.administration,
    // Руководство сервера
    guildCategoriesId.managersServers,
    // Структура хелперства
    guildCategoriesId.helpers,
    // Стримы/видео ютуб
    guildCategoriesId.youtube
  ],
};
