const { ApplicationCommandOptionType, MessageMentions } = require('discord.js')
const getAllRolesIdFamilies = require('../components/getAllRolesIdFamilies')
const getAllRolesIdModers = require('../components/getAllRolesIdModers')
const CoinsUsers = require('../models/CoinsUsers')
const Families = require('../models/Families')





// Айдишники серверов
const guildsId = {
  surprise: "603603887668330496",
  surpriseTest: "992774340925984778",
  redrockTest: "991804363276300348"
}
//


const _rolesId = {
  // айдишники ролей

  // Arizona Surprise Test
  [guildsId.surpriseTest]: {
    // Игрок мафии
    mafia: `992774340938571817`,
    // 🔒Support Blocked🔒
    supportBlock: `992774341274128486`,
    // Технический отдел
    techSection: `992774341274128487`,
    // Legendary Surprise
    legendarySurprise: `992774341047635968`,
    // Discord Master
    discordMaster: `992774341374775426`,
    // Jr. Discord Master
    juniorDiscordMaster: `992774341274128489`,
    // Все пользователи
    everyone: `992774340925984778`,
    // 🏖 Неактив 🏖
    neactive: `992774341253136551`,
    // Event's
    events: `992774340938571816`,
    // проверенный
    verify: `992774340925984779`,
    // ⬇➖ Семьи ➖⬇
    fams: `992774341064396906`,
    // Главный администратор
    mainAdmin: `992774341395750916`,
    // Заместитель главного администратора
    deputyMainAdmin: `992774341395750915`,
    // Куратор
    curator: `992774341395750913`,
    // Мл. Администратор [1-2 ур]
    juniorAdmins: `992774341320245320`,
    // Администратор 3 ур.
    adminsThreeLVL: `992774341320245321`,
    // Администратор 4 ур.
    adminsFourLVL: `992774341320245323`,
    // Совет администрации
    adviceAdministration: `992774341274128488`,
    // куратор модерации
    curatorModeration: `992774341274128484`,
    // модератор
    moderator: `992774341253136553`,
    // мл.модератор
    juniorModerator: `992774341253136552`,
    // ✖ Muted ✖
    muted: `992774341274128485`,
    // Следящий ЦА
    spectatorGov: `992774341295083609`,
    // Следящий МЮ
    spectatorPolice: `992774341295083608`,
    // Следящий МО
    spectatorArmy: `992774341295083607`,
    // Следящий МЗ
    spectatorHealth: `992774341295083606`,
    // Следящий СМИ
    spectatorRadio: `992774341295083605`,
    // Руководство ГОС
    mainSpectatorsState: `992774341374775422`,
    // Следящий ГОС
    spectatorState: `992774341345431651`,
    // Боты
    bots: `992774341374775425`,
    // Заместители фракции
    deputiesFractions: `992774341232177189`,
    // Лидеры фракции
    leadersFractions: `992774341232177190`,
    // Министры
    ministers: `992774341232177191`,
    // Infomaker
    infoMaker: `992774341253136547`,
    // Chief news
    chiefInfoMaker: `992774341253136550`,
    // Сотрудник SWAT
    swat: `992774341160865942`,
    // Сотрудник LSPD
    lspd: `992774341160865943`,
    // Сотрудник LVMPD
    lvmpd: `992774341118935059`,
    // Сотрудник RCSD
    rcsd: `992774341118935058`,
    // Сотрудник FBI
    fbi: `992774341160865945`,
    // Академист FBI
    fbi_academy: `992774341160865944`,
    // ★. Роль, которая даёт доступ людям к рассмотрению анкет.
    star: `992774341345431650`,
    // Кандидат на собеседование
    colloquyCandidate: `992774340925984781`,
    // Сотрудник гос.организации
    stateEmployee: `992774341207015505`,
    // Сотрудник правительства
    government: `992774341186027563`,
    // Сотрудник ГЦЛ
    licenseEmployee: `992774341186027560`,
    // Сотрудник центрального банка
    bank: `992774341160865951`,
    // Сотрудник страховой компании
    insuranceCompany: `992774341160865950`,
    // Сотрудник Федеральной Тюрьмы
    prison: `992774341118935053`,
    // Сотрудник Больницы ЛС
    lsmc: `992774341085372435`,
    // Сотрудник Больницы СФ
    sfmc: `992774341085372434`,
    // Сотрудник Больницы ЛВ
    lvmc: `992774341085372433`,
    // Сотрудник СМИ ЛС
    lsfm: `992774341085372428`,
    // Сотрудник СМИ СФ
    sffm: `992774341085372427`,
    // Сотрудник СМИ ЛВ
    lvfm: `992774341064396910`,
    // Военнослужащий ЛСа
    lsa: `992774341118935055`,
    // Военнослужащий СФа
    sfa: `992774341118935054`,
    // ✘
    x: `992774340925984780`,
    // Легендарный
    legendary: `992774340997296229`,
    // Ветеран
    veteran: `992774340997296228`,
    // Многоуважаемая личность
    dearPersonality: `992774340967944273`,
    // Надежда новичков
    newcomersHope: `992774340967944272`,
    // Уважаемый участник
    dearMember: `992774340967944271`,
    // Мыслитель
    thinker: `992774340967944270`,
    // Активист
    activist: `992774340967944269`,
    // Опытный
    experienced: `992774340967944268`,
    // Бывалый
    seasoned: `992774340967944266`,
    // Житель
    inhabitant: `992774340967944267`,
    // Приятный гость
    niceGuest: `992774340967944265`,
    // Приезжий
    visitor: `992774340967944264`,
    // Турист
    tourist: `992774340938571825`,
    // V.I.P
    vip: `992777610822172742`,
    // Легендарный ОЛД Surpris'a
    legendaryOldSurprise: `992774341232177185`,
    // Лучший модератор недели
    theBestWeekModerator: `992777843601838113`,
  },
  // Arizona RedRock Test
  [guildsId.redrockTest]: {
    // Игрок мафии
    mafia: `991804363276300352`,
    // 🔒Support Blocked🔒
    supportBlock: `992502586676613190`,
    // Технический отдел
    techSection: `991804363926409236`,
    // Legendary Surprise
    legendarySurprise: `991804363330818101`,
    // ⚡ Technical Administrator Discord ⚡
    discordMaster: `991804363926409236`,
    juniorDiscordMaster: `991804363926409236`,
    // Все пользователи
    everyone: `991804363276300348`,
    // 🏖 Неактив 🏖
    neactive: `992503319069212762`,
    // Event's
    events: `992503513324204032`,
    // проверенный
    verify: `991804363305668736`,
    // ⬇➖ Семьи ➖⬇
    fams: `991804363410522224`,
    // Главный администратор
    mainAdmin: `991804363926409238`,
    // Заместитель главного администратора
    deputyMainAdmin: `991804363926409238`,
    // Куратор
    curator: `991804363926409237`,
    // Мл. Администратор [1-2 ур]
    juniorAdmins: `991804363829956651`,
    // Администратор 3 ур.
    adminsThreeLVL: `991804363829956653`,
    // Администратор 4 ур.
    adminsFourLVL: `991804363829956654`,
    // Руководство модерации
    adviceAdministration: `991804363767029825`,
    // куратор модерации
    curatorModeration: `991804363767029824`,
    // Support
    moderator: `991804363767029822`,
    // Модератор
    juniorModerator: `991804363767029821`,
    // ✖ Muted ✖
    muted: `991804363901255683`,
    // Следящий ЦА
    spectatorGov: `991804363829956649`,
    // Следящий МЮ
    spectatorPolice: `991804363829956648`,
    // Следящий МО
    spectatorArmy: `991804363792199719`,
    // Следящий МЗ
    spectatorHealth: `991804363792199718`,
    // Следящий СМИ
    spectatorRadio: `991804363792199717`,
    // Руководство ГОС
    mainSpectatorsState: `991804363901255682`,
    // Следящий ГОС
    spectatorState: `991804363901255680`,
    // Боты
    bots: `991804363901255689`,
    // Заместители фракции
    deputiesFractions: `991804363704107051`,
    // Лидеры фракции
    leadersFractions: `991804363704107052`,
    // Министры
    ministers: `991804363737682041`,
    // Вестник
    infoMaker: `991804363767029823`,
    chiefInfoMaker: `991804363767029823`,
    // Сотрудник SWAT
    swat: `991804363498602550`,
    // Сотрудник LSPD
    lspd: `991804363498602551`,
    // Сотрудник LVPD
    lvmpd: `991804363498602548`,
    // Сотрудник RCSD
    rcsd: `991804363498602549`,
    // Сотрудник ФБР
    fbi: `991804363498602553`,
    // Академист FBI
    fbi_academy: `991804363498602553`,
    // ★. Роль, которая даёт доступ людям к рассмотрению анкет.
    star: ``,
    // Кандидат на собеседование
    colloquyCandidate: `992505787056390154`,
    // Сотрудник гос.организации
    stateEmployee: `992525571387039815`,
    // Сотрудник правительства
    government: `991804363498602556`,
    // Сотрудник Автошколы
    licenseEmployee: `991804363498602554`,
    // Сотрудник центрального банка
    bank: `991804363498602555`,
    // Сотрудник страховой компании
    insuranceCompany: `991804363469226024`,
    // Сотрудник ТСР
    prison: `991804363469226023`,
    // Сотрудник Больницы ЛС
    lsmc: `991804363469226018`,
    // Сотрудник Больницы СФ
    sfmc: `991804363469226017`,
    // Сотрудник Больницы ЛВ
    lvmc: `991804363469226016`,
    // Сотрудник СМИ ЛС
    lsfm: `991804363439870062`,
    // Сотрудник СМИ СФ
    sffm: `991804363439870061`,
    // Сотрудник СМИ ЛВ
    lvfm: `991804363439870060`,
    // Военнослужащий ЛСа
    lsa: `991804363469226020`,
    // Военнослужащий СФа
    sfa: `991804363469226019`,
    // ✘
    x: `948675243025764406`,
    // ✨ Утренняя звезда
    legendary: `991804363381158008`,
    // Пажилой Редрокорианец 👴
    veteran: `991804363330818101`,
    // Повелитель банановых островов 🍌
    dearPersonality: `948675243055149085`,
    // Император 👑
    newcomersHope: `948675243055149084`,
    // Герой Ред-Рока 🦸
    dearMember: `948675243055149083`,
    // Народный артист 🎭
    thinker: `948675243055149082`,
    // Ветеран Ред-Рока 🎖️
    activist: `948675243055149081`,
    // Страж 🛡️
    experienced: `948675243055149080`,
    seasoned: ``,
    inhabitant: ``,
    niceGuest: ``,
    visitor: ``,
    tourist: ``,
    // V.I.P
    vip: `992532649518317598`,
    // Легендарный ОЛД
    legendaryOldSurprise: `992532748881371206`,
    // Лучший модератор недели
    theBestWeekModerator: `992531912688152576`,
  }
}
const _channelsId = {
  // Arizona Surprise Test
  [guildsId.surpriseTest]: {
    // теги-организации
    rolesForms: `992774348198912027`,
    // 🏖│лог-неактивов
    neactiveLog: `992774342276558972`,
    // ивенты / #🔥│ивенты
    events: '992774347070640170',
    // общение-семей
    famGeneral: `992774345350975534`,
    // лог-семей
    famLogs: `992774342687588377`,
    // тест-комната
    testRoom: `992774342687588373`,
    // правила-дискорда
    rules: `992774344038162437`,
    // log-monitoring
    logMonitoring: `992774343258013790`,
    // онлайн-фракции
    onlineFraction: `992774344038162438`,
    // уведомления
    notifications: `992779524519501875`,
    // welcome
    welcome: `992774344222724188`,
    // 🔐-moderation-log
    moderationLog: `992774355517968448`,
    // кураторская
    curators: `992774341974577196`,
    // модераторы
    moderation: `992774341974577197`,
    // система-выговоров-модераторам
    punishModeratorsLog: `992774341974577199`,
    // дискорд-мастера
    discordMasters: `992774341974577193`,
    // совет-администрации-дискорда
    administrationCouncil: `992774341974577195`,
    // нарушения руководящего состава
    punishLeadership: `992774342276558973`,
    // 🔔│support
    support: `992774344038162440`,
    // роли-баны
    rolesAndBans: `992774355752853527`,
    // запрос-ролей
    requestRoles: `992774344222724193`,
    // лог-покупок-модераторов
    logBuysModerators: `992774341974577200`,
    // инфомейкеры
    infomakers: `992774347070640171`,
    // 🧲・Создать приват
    createPrivate: `992774344474366088`,
    // 🔊-голосовые
    voicesLog: `992774355752853525`,
    // Патруль(канал создания привата патруля)
    createPatrolPrivate: `992774353437601804`,
    // Создать канал фильма
    createFilmPrivate: `992774344474366091`,
    // Создать канал Аниме
    createAnimePrivate: `992774344675696640`,
    // Создать комнату мафии
    createMafiaPrivate: `992774345350975529`,
    // управление
    managePrivate: `992823448428630147`,
    // первые шаги
    firstSteps: `992774344038162436`,
    // discord-info
    discordInfo: `992792621556715530`,
    // руководство гос
    mainGovManagers: `992774347666243613`,
    // главные следящие
    mainManagersGovStructures: `992774347913695367`,
    // лог выдачи предов
    logGivesWarnsLeaders: `992774347913695371`,
    // следящие гос
    spectatorsStructures: `992774348198912021`,
    // лог выдачи страйков
    logGivesStrikesSpectators: `992774347913695370`,
    // нововведения по структурам
    updatesStructures: `992774347913695366`,
    // еженедельный отчёт
    everyWeekReport: `992774347666243614`,
    // одобренные-анкеты
    acceptedQuestionnaire: `992774347913695362`,
    // отказанные-анкеты
    dontAcceptedQuestionnaire: `992774347913695363`,
    // отправка-анкет
    sendQuestionnaire: `992774347913695364`,
    // проверяющие-жалобы
    checkersReportsAdmins: `992774347913695368`,
    // анкеты на рассмотрение
    questionnairesForCheck: `992774347913695365`,
    // следящие-ЦА
    spectatorGov: `992774348719018052`,
    // следящие-МЮ
    spectatorPolice: `992774351525007388`,
    // следящие-МО
    spectatorArmy: `992774350082166842`,
    // следящие-МЗ
    spectatorHealth: `992774353437601806`,
    // следящие-СМИ
    spectatorRadio: `992774354087727112`,
    // совершенно секретно
    verySecret: `992774341974577194`,
    // сообщения
    messagesLog: `992774355517968453`,
    // Комната ожидания собеседования
    waitingColloquy: `992774347666243611`,
    // Собеседование 1
    colloquy1: `992774347666243606`,
    // Собеседование 2
    colloquy2: `992774347666243607`,
    // Собеседование 3
    colloquy3: `992774347666243608`,
    // Собеседование 4
    colloquy4: `992774347666243609`,
    // Собеседование 5
    colloquy5: `992774347666243610`,
    // 📃-логи-тикетов
    ticketsLog: `992774355752853529`,
    // 💡║requests-for-roles
    requestsForGiveRole: `992774342687588375`,
    // предложения-по-улучшениям
    requestForUpdates: `992774344222724195`,
    // updates
    updates: `992774342276558978`,
    // surprise-coins
    coins: `992774344222724191`,
    // лог-surprisecoins
    logCoins: `992774342687588378`,
    // сообщения-d
    messagesDelete: `992774355517968450`,
    // Входы-выходы
    joinsAndExits: `992774355517968452`,
    // логи-пользователей
    logUsers: `992774355517968451`,
    // automoderation-logs
    autoModeration: `992774355752853526`,
    // лог-ролей
    logRoles: `992774342687588376`
  },
  // Arizona Redrock Test
  [guildsId.redrockTest]: {
    // теги-организации
    rolesForms: `991804371597795463`,
    // 🏖│лог-неактивов
    neactiveLog: `991804368548536324`,
    // ивенты / #🔥│ивенты
    events: '992535236447567953',
    // общение-семей
    famGeneral: `991804371128045694`,
    // лог-семей
    famLogs: `992535363480453280`,
    // тест-комната
    testRoom: `991804367621587056`,
    // правила
    rules: `991804368833761354`,
    // log-monitoring
    logMonitoring: `991804364811403405`,
    // онлайн-фракции
    onlineFraction: `991804368833761356`,
    // уведомления
    notifications: `992536048259305534`,
    // Общий чат
    welcome: `991804369882333214`,
    // наказания
    moderationLog: `991804367621587054`,
    // Кураторская
    curators: `992536506650595398`,
    // модераторы
    moderation: `991804368548536324`,
    // фиксации-предупреждений
    punishModeratorsLog: `991804368548536325`,
    // дискорд-мастера
    discordMasters: `992536506650595398`,
    // совет-администрации-дискорда
    administrationCouncil: `992536506650595398`,
    // нарушения руководящего состава
    punishLeadership: `991804368548536327`,
    // 🔔│support
    support: `991804369882333218`,
    // роли-баны
    rolesAndBans: `991804367193772072`,
    // запрос-ролей
    requestRoles: `991804368548536321`,
    // лог-покупок-модераторов
    logBuysModerators: `991804368548536328`,
    // инфомейкеры
    infomakers: `991804368066203804`,
    // 🧲・Создать приват
    createPrivate: `991804370368860284`,
    // 🔊-голосовые
    voicesLog: `991804367193772067`,
    createPatrolPrivate: ``,
    createFilmPrivate: ``,
    createAnimePrivate: ``,
    createMafiaPrivate: ``,
    // управление
    managePrivate: `992537313450143826`,
    // чаво
    firstSteps: `991804368833761355`,
    // новости
    discordInfo: `992537519063310408`,
    // теги-организации
    tagsFractions: `972849565873094696`,
    // руководство гос
    mainGovManagers: `991804371597795466`,
    // главные следящие
    mainManagersGovStructures: `991804371597795466`,
    // лог выдачи предов
    logGivesWarnsLeaders: ``,
    // следящие гос
    spectatorsStructures: ``,
    // лог выдачи страйков
    logGivesStrikesSpectators: ``,
    // нововведения по структурам
    updatesStructures: `991804371597795465`,
    // еженедельный отчёт
    everyWeekReport: ``,
    // одобренные-анкеты
    acceptedQuestionnaire: `991804372029800506`,
    // отказанные-анкеты
    dontAcceptedQuestionnaire: `991804372029800506`,
    // отправка-анкет
    sendQuestionnaire: `991804372029800506`,
    // проверяющие-жалобы
    checkersReportsAdmins: ``,
    // анкеты на рассмотрение
    questionnairesForCheck: `991804372029800506`,
    // следящие-право
    spectatorGov: `991804372398919709`,
    // следящие-мю
    spectatorPolice: `991804374030491821`,
    // следящие-МО
    spectatorArmy: `991804376551268481`,
    // следящие-МЗ
    spectatorHealth: `991804377817948324`,
    // следящие-СМИ
    spectatorRadio: `991804378786840650`,
    // совершенно секретно
    verySecret: ``,
    // сообщения
    messagesLog: `991804367193772068`,
    // Комната ожидания собеседования
    waitingColloquy: `991804370368860287`,
    // Собеседование 1
    colloquy1: `991804370368860288`,
    // Собеседование 2
    colloquy2: `991804370368860289`,
    // Собеседование 3
    colloquy3: `991804370767327303`,
    // Собеседование 4
    colloquy4: `991804370767327304`,
    // Собеседование 5
    colloquy5: `991804370767327305`,
    // 📃-логи-тикетов
    ticketsLog: `991804367621587055`,
    // 💡║requests-for-roles
    requestsForGiveRole: `991804368548536321`,
    // предложения (канал для заливки заявок)
    requestForUpdates: `991804369882333219`,
    // предложения для улучшения (канал для рассмотрения)
    updates: `992539331837308968`,
    // surprise-coins
    coins: `992539489073373265`,
    // лог-surprisecoins
    logCoins: `992539532585087077`,
    // сообщения-d
    messagesDelete: `991804367193772068`,
    // Входы-выходы
    joinsAndExits: `991804367193772071`,
    // логи-пользователей
    logUsers: `991804367193772071`,
    // automoderation-logs
    autoModeration: `992539670036623490`,
    // лог-ролей
    logRoles: `991804367193772063`
  },
}

const _categories = {
  // Arizona Surprise Test
  [guildsId.surpriseTest]: {
    // Семейные роли
    famsRoles: '992774341064396906',
    // Семейные каналы
    famsChannels: `992774345350975533`,
    // Фильмы/аниме
    movies: `992774344474366089`,
    // Модерация
    moders: `992774341974577192`,
    // Корзина
    basketTickets: `992774355245355065`,
    // Персональные роли категория
    peopleRoles: `992774341018263588`,
    // Приватный блок
    privatesBlock: `992774344474366086`,
    // Блок мафии
    blockMafia: `992774345065775130`,
    // Автоматические каналы(патрули)
    patrol: `992774353437601804`,
    // Администрация
    administration: `992774343069274251`,
    // Руководство сервера
    managersServers: `992774342863769704`,
    // Структура хелперства
    helpers: `992774343673262120`,
    // Стримы сюрпрайз
    youtube: `992774355245355061`,
    // Активные тикеты
    activeTickets: `992774342863769703`,
    // Тикеты на рассмотрении
    holdTickets: `992774342687588381`
  },
  // Arizona RedRock Test
  [guildsId.redrockTest]: {
    // Семейные роли
    famsRoles: '991804363410522224',
    // Семейные каналы
    famsChannels: `991804371128045693`,
    // Фильмы/Аниме
    movies: `992774344474366089`,
    // Модерация
    moders: `991804368066203802`,
    // Корзина
    basketTickets: `991804379734736998`,
    // Персональные роли категория
    peopleRoles: `991804363439870053`,
    // Приватный блок
    privatesBlock: `991804370368860282`,
    // Блок мафии
    blockMafia: ``,
    // Автоматические каналы(патрули)
    patrol: ``,
    // Администрация
    administration: `991804364811403403`,
    // Руководство сервера
    managersServers: `991804364811403403`,
    // Структура хелперства
    helpers: `991804364811403403`,
    // стримы
    youtube: ``,
    // Активные тикеты
    activeTickets: `991804368066203801`,
    // Тикеты на рассмотрении
    holdTickets: `991804367621587063`
  },
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
    rolesId.juniorDiscordMaster,
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

const tagsFractions = (guildId, rolesId) => {
  // Sedona другие теги
  if(guildId === guildsId.redrockTest){
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

  // Surprise теги
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

const checkFamilyPass = async() => {
  const family = await Families.find();

  const hasPass = family.filter(families => families.familyPass) // Фильтруем семьи с подпиской

  return hasPass.map(fam => {
    return {
      owner: fam.ownerId,
      role: fam.roleId
    } // Возвращаем обьект с данными
  })
}

const checkUserPass = async () => {
  const user = await CoinsUsers.find();

  const hasPass = user.filter(users => users.userPass) // Фильтруем пользователей с подпиской

  return hasPass.map(member => {
    return {
      owner: member.ownerId,
      role: member.roleId
    } // Возвращаем обьект с данными
  })
}

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
  // Цена на нестандартный шрифт.
  customFontPrice: 10,
  // Цена на возможность отправлять эмодзи, стикеры в #welcome. (на месяц)
  customEmojiAndStickersPrice: 10,
  // Цена на один уровень /rank
  oneLevelRankPrice: 5,
  // Цена family pass в месяц
  famPassMonthPrise: 75,
  // Цена пользовательской подписки
  userPassPrice: {
    month: 50,
    week: 20
  },

  // Коэффициент ролей по отношению к депозиту.
  rolesDepositCoefficient: async (rolesId) => {
    return [
      {
        type: 'role',
        id: rolesId.visitor,
        coefficient: 0.015
      }, // Приезжий
      {
        type: 'role',
        id: rolesId.niceGuest,
        coefficient: 0.015
      }, // Приятный гость
      {
        type: 'role',
        id: rolesId.seasoned,
        coefficient: 0.015
      }, // Бывалый
      {
        type: 'role',
        id: rolesId.inhabitant,
        coefficient: 0.015
      }, // Житель
      {
        type: 'role',
        id: rolesId.experienced,
        coefficient: 0.015
      }, // Опытный
      {
        type: 'role',
        id: rolesId.activist,
        coefficient: 0.03
      }, // Активист
      {
        type: 'role',
        id: rolesId.thinker,
        coefficient: 0.03
      }, // Мыслитель
      {
        type: 'role',
        id: rolesId.vip,
        coefficient: 0.05
      }, // V.I.P
      {
        type: 'role',
        id: rolesId.newcomersHope,
        coefficient: 0.05
      }, // Надежда новичков
      {
        type: 'role',
        id: rolesId.dearMember,
        coefficient: 0.05
      }, // Уважаемый участник
      {
        type: 'role',
        id: rolesId.dearPersonality,
        coefficient: 0.07
      }, // Многоуважаемая личность
      {
        type: 'role',
        id: rolesId.veteran,
        coefficient: 0.07
      }, // Ветеран
      {
        type: 'role',
        id: rolesId.legendary,
        coefficient: 0.1
      }, // Легендарный
      ...(
        (
          await getAllRolesIdModers(rolesId)
        ).map((moderRoleId) => {
          return {
            type: 'role',
            id: moderRoleId,
            coefficient: 0.03
          } // Все модерские роли
        })
      ),
      ...(
        (
          await getAllRolesIdFamilies(rolesId)
        ).map((familyRoleId) => {
          return {
            type: 'role',
            id: familyRoleId,
            coefficient: 0.03 
          } // Все семейные роли
        })
      ),
      ...(
        (
          await checkFamilyPass()
        ).map((familyWithPass) => {
          return {
            type: 'role',
            id: familyWithPass.roleId,
            coefficient: 0.03 
          } // Роли семей с подпиской
        })
      ),
      ...(
        (
          await checkUserPass()
        ).map((userWithPass) => {
          return {
            type: 'user',
            id: userWithPass.userId,
            coefficient: 0.03 
          } // Пользователи с подпиской
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
  ],
  
  rolesReputationGive: () => {
    return [
      {
        id: rolesId.juniorDiscordMaster,
        rep: 2
      }
    ]
  }
}

module.exports = {
  // Функция для получения всех айди ролей сервера
  getGuildRolesId(guildId){
    return _rolesId[guildId];
  },
  // Функция для получения всех айди каналов сервера
  getGuildChannelsId(guildId){
    return _channelsId[guildId];
  },
  // Функция для получения всех айди категорий сервера
  getGuildCategoriesId(guildId){
    return _categories[guildId];
  },

  // Каналы в которые при входе создаётся приват.
  channelsForCreatePrivate,
  // Настройки саппорта
  supportSettings,
  // Категории в которых находятся приваты
  categoriesPrivatesId,
  // Теги организации
  tagsFractions,
  // Айди серверов на которых может использоваться данный бот. (Для guilds.fetch)
  availableGuildsId: [
      guildsId.surprise,
      guildsId.surpriseTest,
      guildsId.redrockTest
  ],
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
  token: 'OTU3NTg5MDQxODgzMjUwNjk5.GA8HR8.4RQcjlslxVmsmQf-T6dUev8-K0xH1PuLtFkO5g',
  // настройка базы данных
  database: {
    // URL для подключения к бд
    url: `mongodb://localhost:27017/arizona_10`
  },
  // Расценки за одно наказание в баллах. БЕЗ УЧЕТА КОЭФФИЦЕНТА!!
  rates: {
    // Расценка за один бан
    ban: 1,
    // Расценка за одну выданную/отказанную роль
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
  messagesIgnoredCategoriesId,
  // Коэффициент на который умножается сумма баллов за выдачу быстрого бана.
  fastBanCoefficient: 4,
  // Ссылки на разделы жалоб модерации серверов
  linksToReportModerators: {
    "992774340925984778": "https://forum.robo-hamster.com/forums/49/",
    "991804363276300348": "https://forum.robo-hamster.com/forums/367/"
  },
  // Номера серверов по айдишникам серверов
  numbersServersByGuildId: {
    "992774340925984778": "10",
    "991804363276300348": "8",
  }
}