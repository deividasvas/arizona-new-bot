const { ApplicationCommandOptionType, MessageMentions } = require('discord.js')
const getAllRolesIdFamilies = require('../components/getAllRolesIdFamilies')
const getAllRolesIdModers = require('../components/getAllRolesIdModers')
const rolesId = {
  // айдишники ролей
  '948675243025764404': {
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
    colloquyCandidate: `948675243025764407`,
    // Сотрудник гос.организации
    stateEmployee: `948675243201949794`,
    // Сотрудник правительства
    government: `948675243201949787`,
    // Сотрудник ГЦЛ
    licenseEmployee: `948675243185152060`,
    // Сотрудник центрального банка
    bank: `948675243185152059`,
    // Сотрудник страховой компании
    insuranceCompany: `948675243185152058`,
    // Сотрудник ТСР
    prison: `948675243172564994`,
    // Сотрудник Больницы ЛС
    lsmc: `948675243151601700`,
    // Сотрудник Больницы СФ
    sfmc: `948675243151601699`,
    // Сотрудник Больницы ЛВ
    lvmc: `948675243151601698`,
    // Сотрудник СМИ ЛС
    lsfm: `948675243151601694`,
    // Сотрудник СМИ СФ
    sffm: `948675243134828612`,
    // Сотрудник СМИ ЛВ
    lvfm: `948675243134828611`,
    // Военнослужащий ЛСа
    lsa: `948675243172564996`,
    // Военнослужащий СФа
    sfa: `948675243172564995`,
    // ✘
    x: `948675243025764406`,
    // Легендарный
    legendary: `948675243071909899`,
    // Ветеран
    veteran: `948675243071909898`,
    // Многоуважаемая личность
    dearPersonality: `948675243055149085`,
    // Надежда новичков
    newcomersHope: `948675243055149084`,
    // Уважаемый участник
    dearMember: `948675243055149083`,
    // Мыслитель
    thinker: `948675243055149082`,
    // Активист
    activist: `948675243055149081`,
    // Опытный
    experienced: `948675243055149080`,
    // Бывалый
    seasoned: `948675243055149079`,
    // Житель
    inhabitant: `948675243055149078`,
    // Приятный гость
    niceGuest: `948675243055149077`,
    // Приезжий
    visitor: `948675243055149076`,
    // Турист
    tourist: `948675243038363707`,
    // V.I.P
    vip: `978383751732166657`
  }
}
const channelsId = {
  '948675243025764404': {
    // теги-организации
    rolesForms: `972849565873094696`,
    // 🏖│лог-неактивов
    neactiveLog: `948675243826888765`,
    // ивенты / #🔥│ивенты
    events: '948675246825828471',
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
    // 💡║requests-for-roles
    requestsForGiveRole: `948675244065947648`,
    // предложения-по-улучшениям
    requestForUpdates: `948675245307469892`,
    // updates
    updates: `948675243826888771`,
    // surprise-coins
    coins: `948675245307469886`,
    // лог-surprisecoins
    logCoins: `948675244065947652`,
    // сообщения-d
    messagesDelete: `948675252353916946`,
    // Входы-выходы
    joinsAndExits: `948675252697825373`,
    // логи-пользователей
    logUsers: `948675252697825372`,
    // automoderation-logs
    autoModeration: `948675252697825370`
  }
}

const channelsForCreatePrivate = (guildChannelsId, guildRolesId) => {
  return [
    {
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
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels'],
          deny: ['Administrator']
        }
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
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels'],
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
        }
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
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels'],
          deny: ['Administrator']
        }
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
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels'],
          deny: ['Administrator']
        }
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
          allow: ['ViewChannel', 'Connect', 'Speak', 'MuteMembers', 'MoveMembers', 'ManageChannels'],
          deny: ['Administrator']
        }
      ]
    }
  ]
}

const supportSettings = {
  // Начало названия тикета
  ticketNameStartsWith: 'ticket',
  // Айди ролей, которые будут отвечать на тикеты. (Пинг этих ролей происходит в тикете)
  getModeratorsPermissionRolesId: (rolesId) => [
    rolesId.moderator,
    rolesId.juniorModerator
  ],
  // Айди ролей, которые имеют ПОЛНЫЙ доступ к тикетам.
  // Даже к тому, чтобы закрыть его не являясь отвечающим на него.
  getFullPermissionRolesId: (rolesId) => [
    rolesId.mainAdmin,
    rolesId.deputyMainAdmin,
    rolesId.curator,
    rolesId.discordMaster,
    rolesId.juniorModerator,
    rolesId.adviceAdministration
  ]
}

const categoriesPrivatesId = categories => [
  // Приватный блок
  categories.privatesBlock,
  // Фильмы/аниме
  categories.movies,
  // Блок мафии
  categories.blockMafia,
  // Патрули
  categories.patrol
]

const categories = {
  '948675243025764404': {
    // Семейные роли
    fams: '948675246016299023',
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
    activeTickets: `948675244065947655`,
    // Тикеты на рассмотрении
    holdTickets: `974718165776990228`
  }
}

const fullPermissionCommandsRolesId = (rolesId) => [
  // ГА
  rolesId.mainAdmin,
  // ЗГА
  rolesId.deputyMainAdmin,
  // Куратор
  rolesId.curator,
  // Дискорд Мастер
  rolesId.discordMaster,
  // Junior дискорд мастер
  rolesId.juniorDiscordMaster
]

const typesArguments = [
  {
    type: ApplicationCommandOptionType.Number,
    value: `Число`,
    validator (val) {
      return !isNaN(val)
    }
  },
  {
    type: ApplicationCommandOptionType.User,
    value: `ID пользователя | упоминание пользователя`,
    validator (val, guild) {
      return Boolean(
        guild.members.cache.get(val) ||
        MessageMentions.UsersPattern.test(val)
      )
    }
  },
  {
    type: ApplicationCommandOptionType.Channel,
    value: `ID канала | упоминание канала`,
    validator (val, guild) {
      return Boolean(
        guild.channels.cache.get(val) ||
        MessageMentions.ChannelsPattern.test(val)
      )
    }
  },
  {
    type: ApplicationCommandOptionType.Role,
    value: `ID роли | упоминание роли`,
    validator (val, guild) {
      return Boolean(
        guild.roles.cache.get(val) || MessageMentions.RolesPattern.test(val)
      )
    }
  },
  {
    type: ApplicationCommandOptionType.Boolean,
    value: `True | False`,
    validator (val) {
      return val === true || val === false
    }
  },
  {
    type: ApplicationCommandOptionType.String,
    value: `Строка`,
    validator (val) {
      return typeof val === 'string'
    }
  }
]

const whiteListRoles = (rolesId) => [
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
  rolesId.juniorModerator // младший модератор
]

const fromPostToPostList = (rolesId) => [
  {
    // совет администрации
    fromRoleId: rolesId.adviceAdministration,
    // понижают до куратора модерации
    toRoleId: rolesId.curatorModeration
  },
  {
    // куратор модерации
    fromRoleId: rolesId.curatorModeration,
    // понижают до старшего модератора
    toRoleId: rolesId.moderator
  },
  {
    // куратор модерации
    fromRoleId: rolesId.moderator,
    // понижают до младшего модератора
    toRoleId: rolesId.juniorModerator
  }
]

const messagesIgnoredChannelsId = (guildChannelsId) => [
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
]

const messagesIgnoredCategoriesId = (guildCategoriesId) => [
  // Администрация
  guildCategoriesId.administration,
  // Руководство сервера
  guildCategoriesId.managersServers,
  // Структура хелперства
  guildCategoriesId.helpers,
  // Стримы/видео ютуб
  guildCategoriesId.youtube
]

const tagsFractions = (rolesId) => {
  return {
    'GOV': rolesId.government,
    'ГЦЛ': rolesId.licenseEmployee,
    'ЦБ': rolesId.bank,
    'СТК': rolesId.insuranceCompany,
    'FBI': rolesId.fbi,
    'LSPD': rolesId.lspd,
    'SWAT': rolesId.swat,
    'LVMPD': rolesId.lvmpd,
    'RCSD': rolesId.rcsd,
    'ЛСА': rolesId.lsa,
    'СФА': rolesId.sfa,
    'ТСР': rolesId.prison,
    'TCP': rolesId.prison,
    'LSMC': rolesId.lsmc,
    'SFMC': rolesId.sfmc,
    'LVMC': rolesId.lvmc,
    'CNN LS': rolesId.lsfm,
    'CNN SF': rolesId.sffm,
    'CNN LV': rolesId.lvfm
  }
}

const combinationsRockPaperScissors = [
  {
    item: `камень`,
    hit: 'ножницы'
  },
  {
    item: `ножницы`,
    hit: `бумага`
  },
  {
    item: `бумага`,
    hit: `камень`
  }
]

// const questionsWords = [
//   { 'text': 'Как зовут квестового NPC в деревне Монтгомери?', 'answers': ['майкл'] },
//   {
//     'text': 'Есть один аксессуар устрашающий одевается на лицо но он доступен всем новичкам?',
//     'answers': ['маска демона']
//   },
//   { 'text': 'Сколько лет проекту Arizona Role Play?', 'answers': ['6', 'шесть', 'six'] },
//   {
//     'text': 'Какой пятый сервер по счёту на проекте Arizona Role Play?',
//     'answers': ['brainburg', 'брайнбург', 'брэйнбург', 'браинбург']
//   },
//   { 'text': 'Бывший куратор с фамилией Fede ( Nick Name )?', 'answers': ['nastasi fede', 'nastasi_fede'] },
//   {
//     'text': 'На какой должности стоял Artem Vlasov до поста Главного Администратора?',
//     'answers': ['зга', 'зам.гл.адм', 'заместитель главного администратора']
//   },
//   {
//     'text': 'Директор, бывший пиар-менеджер Arizona Role Play? ( Nick Name )?',
//     'answers': ['sam mason', 'sam_mason', 'сэм мейсон', 'сэм', 'sam', 'mason', 'масон', 'сэм_мейсон']
//   },
//   { 'text': 'В какое время года был открыт Surprise?', 'answers': ['лето'] },
//   { 'text': 'Первый ГС ГОС Surprise. ( Nick Name )?', 'answers': ['curtis_blood', 'curtis blood'] },
//   { 'text': 'Месяц первого открытия проекта Arizona Role Play?', 'answers': ['июль', '7', 'seven', 'семь'] },
//   {
//     'text': 'Кто основатель проекта Arizona Role PLay?',
//     'answers': ['farmer', 'фармер', 'валик', 'валентин', 'валик гоменюк', 'валентин гоменюк']
//   },
//   {
//     'text': 'Как называется проект от Arizona Games в CRMP?',
//     'answers': ['родина рп', 'родина', 'rodina rp', 'rodina']
//   },
//   { 'text': 'Первый сервер Arizona Role Play?', 'answers': ['феникс', 'пхеникс', 'phoenix'] },
//   { 'text': 'Кто ведёт канал SampKitchen?', 'answers': ['конор', 'conor'] },
//   {
//     'text': 'Кто стоит на посту Главному Администратору на сервере Mesa? ( Nick Name )',
//     'answers': ['Marco_Beer', 'marco_beer', 'Marco Beer', 'marco beer', 'марко беер', 'марко биир', 'марко бир', 'марко бер']
//   },
//   {
//     'text': 'Дата рождения Артёма Власова ( ГА Surprisa + Формат хх.хх.хххх )?',
//     'answers': ['010499', '01.04.1999', '1.4.1999', '01.4.1999', '1.04.1999']
//   },
//   { 'text': 'Это игровая компания создала проект Arizona Role Play?', 'answers': ['arizona games'] },
//   { 'text': 'Максимальное количество бронзовых рулеток в 1 слоте?', 'answers': ['сто', '100'] },
//   { 'text': 'Кто был первый ГС СМИ сюрпрайз?', 'answers': ['don_Lance', 'don lance', 'до ленс'] },
//   { 'text': 'Сколько игровых серверов на Аризоне(Самп)?', 'answers': ['15', 'пятнадцать'] },
//   { 'text': 'Сколько всего банд(в гетто) существует?', 'answers': ['Шесть', '6'] },
//   { 'text': 'Сколько всего Гос.Организаций есть?', 'answers': ['18'] },
//   {
//     'text': 'Какой налог нужен для слёта дома?',
//     'answers': ['140', '140000', '140 000', '140.000', '140к']
//   },
//   { 'text': 'В каком году был открыт сервер Kingman?', 'answers': ['2020', '20', '2к20', '2k20'] },
//   { 'text': 'Как зовут квестового персонажа на ЖДЛС?', 'answers': ['джереми'] },
//   { 'text': 'Сколько нужно перевезти пицц для выполнения начального квеста?', 'answers': ['15'] },
//   { 'text': 'Какое максимальное количество слотов для машины у 1 игрока с премиум вип?', 'answers': ['20'] },
//   {
//     'text': 'Какая вещь увеличивает скорость у авто?',
//     'answers': ['тт', 'tt', 'twin-turbo', 'twin turbo', 'твин иурбо', 'ивин-иурбо']
//   },
//   {
//     'text': 'Что нужно сделать или получить для выполнения первого начального квеста?',
//     'answers': ['паспорт']
//   },
//   { 'text': 'Сколько всего фракций на Аризона рп?', 'answers': ['28', '24', '29'] },
//   {
//     'text': 'Что бывает 7 раз в неделю и каждый час? ',
//     'answers': ['pd', 'пд', 'payday', 'пейдей', 'пей дей']
//   },
//   { 'text': 'Максимальное количество здоровья у авто?', 'answers': ['5к', '5к', '5000', '5.000', '5 000'] },
//   { 'text': 'Сколько минимум минут нужно отыграть для получения пейдея? ', 'answers': ['20'] },
//   { 'text': 'Сколько всего министров в штате сюрприз?', 'answers': ['8'] },
//   { 'text': 'Сколько всего нелегальных организации на сервере?', 'answers': ['9'] },
//   {
//     'text': 'Сколько всего мест для продажи своего транспорта на Автобазаре(это все вместе и вертолеты и машины)?',
//     'answers': ['95']
//   },
//   {
//     'text': 'Когда была открыта гта 5 аризона?',
//     'answers': ['25.12.20', '25.12.2020', '25 декабря', 'декабре', 'В декабре']
//   },
//   { 'text': 'В каком месяце Conor стал спец.админом?', 'answers': ['январь', '01', '1'] }
// ]

const coinsRates = {
  // Расценок за одно написанное сообщение в койнах
  message: 0.001,
  // Расценок за одну минуту в войсе
  voice: 0.003,
  // Стартовая цена за платформу
  startPlatformPrice: 5,
  // Коэффициент, который добавляется к покупке каждой новой платформы
  platformCoefficient: 1.25,
  // Количество монет за одну активацию промокода которые будут выданы владельцу
  coinsOfActivatePromocodeOwner: 0.5,
  // Количество монет за одну активацию промокода которые будут выданы активирующему.
  coinsOfActivatePromocode: 0.1,
  // Коэффициент койнов при их получении для пользователей. ЕСЛИ ОБЫЧНЫЙ, ТО СТАВИТЬ 1!!!
  coinsCoefficient: 1,
  // Максимальное количество монет которое можно перевести за один день.
  maxPaidOfDay: 10,
  // Процент комиссий. (ДЕЙСТВУЕТ НА ВСЁ!)
  commissionPercent: 5,
  // Минимальная ставка для игры
  betMin: 0.01,
  // Максимальная ставка для игры
  betMax: 3,
  // Количество игр после которого активируется КД на 5 минут
  countGamesForCoolDown: 10,
  // Минимальный уровень для депозита
  minLevelDeposit: 20,
  // Максимальное количество денег на депозите (10k)
  limitDeposit: 10000,
  // Минимальная сумма которая необходима для пополнения депозита
  minSumForRefillDeposit: 10,
  // Максимальная сумма которая необходима для пополнения депозита
  maxSumForRefillDeposit: 100,
  // Максимальный уровень который будет считаться в промокодах.
  promocodeMaxJuniperBotLevel: 100,
  // Коэффициент ролей по отношению к депозиту.
  rolesDepositCoefficient: async (rolesId) => {
    return [
      [rolesId.visitor, 0.015], // Приезжий
      [rolesId.niceGuest, 0.015], // Приятный гость
      [rolesId.seasoned, 0.015], // Бывалый
      [rolesId.inhabitant, 0.015], // Житель
      [rolesId.experienced, 0.015], // Опытный
      [rolesId.activist, 0.03], // Активист
      [rolesId.thinker, 0.03], // Мыслитель
      [rolesId.vip, 0.05], // V.I.P
      [rolesId.newcomersHope, 0.05], // Надежда новичков
      [rolesId.dearMember, 0.05], // Уважаемый участник
      [rolesId.dearPersonality, 0.07], // Многоуважаемая личность
      [rolesId.veteran, 0.07], // Ветеран
      [rolesId.legendary, 0.1], // Легендарный
      ...(
        (
          await getAllRolesIdModers()
        ).map((moderRoleId) => {
          return [moderRoleId, 0.03] // Все модерские роли
        })
      ),
      ...(
        (
          await getAllRolesIdFamilies()
        ).map((familyRoleId) => {
          return [familyRoleId, 0.03] // Все семейные роли
        })
      )
    ]
  },
  // Максимальное количество платформ у игрока
  maxCountPlatforms: 10,
  // Минимальная сумма для игры в лото
  minSumForGameLoto: 0.1,
  // Максимальная сумма для игры в лото
  maxSumForGameLoto: 1,
  // Возможные выигрыши и проценты к ним в лото.
  prizesPercentageLoto: [
    // Ничего, в том числе, ставка не возвращается на закидывается на фонд.
    {
      prize: 'none',
      percent: 75,
    },
    // Та же ставка, что и раньше
    {
      prize: 0,
      percent: 25,
    },
    // Умножение ставки на 2
    {
      prize: `x2`,
      percent: 0.5
    },
    // Умножение ставки на 3
    {
      prize: `x3`,
      percent: 0.1
    },
    // Весь фонд!
    {
      prize: "all",
      percent: 0.01,
    }
  ]
}

module.exports = {
  // Айдишники ролей
  rolesId,

  // Каналы в которые при входе создаётся приват.
  channelsForCreatePrivate,
  // Настройки саппорта
  supportSettings,
  // Категории в которых находятся приваты
  categoriesPrivatesId,
  // Айдишники каналов
  channelsId,
  // Теги организации
  tagsFractions,

  // Категории
  categories,
  developers: [
    '316154352760782849', // * Yuri Lance
    '904648434949169203', // * Deivid Brown
    '691701692256878632' // * Michell Mahonya
  ],
  // Список ролей у которых есть доступ к АБСОЛЮТНО всем слэш командам.
  fullPermissionCommandsRolesId,
  // Белый список ролей по отношению к наказаниям
  whiteListRoles,
  // Типы аргументов. Сделано для messageCreate нормального показа FAQ аргумент типов
  typesArguments,
  // Массив с должностями. Должность с которой понижают, и должность на которую понижают
  fromPostToPostList,
  // Максимальное количество иммунитетов для модераторов
  maxCountImmunities: 2,
  // Максимальное количество предупреждений для модераторов
  maxCountWarns: 2,
  // Максимальное количество выговоров для модераторов
  maxCountRebukes: 3,
  // Расценки системы койнов
  coinsRates,
  // префикс для использования бота
  prefix: '/',
  // токен бота
  token: 'OTYzODc2NzU0OTUzNDk0NTU4.YlceLg.QmLQ10ZLbE1FlU-yBCYV_bw00Rk',
  // настройка базы данных
  database: {
    // URL для подключения к бд
    url: `mongodb://localhost:27017/arizona_10`
  },
  // Расценки за одно наказание в баллах. БЕЗ УЧЕТА КОЭФФИЦЕНТА!!
  rates: {
    // Расценка за один бан
    ban: 1,
    // Расценка за одну выданную/снятую роль
    role: 0.45 / 4,
    // Расценка за один отвеченный тикет
    ticket: 0.55,
    // Расценка за один выданный мут
    mute: 0.55,
    // Расценка за один выданный кик
    kick: 0.50,
    // Расценка за одну снятную роль
    removeRole: 0.45
  },
  // Комбинации для игры камень-ножницы-бумага
  combinationsRockPaperScissors,
  // Максимальное количество заместителей в семье
  limitDeputyInFamilies: 5,
  // Игнорируемые каналы при обновлении/удаление сообщения.
  messagesIgnoredChannelsId,
  messagesIgnoredCategoriesId
}
