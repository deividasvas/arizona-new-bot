const {
  EmbedBuilder,
  Colors, ApplicationCommandOptionType,
  MessageMentions
} = require('discord.js')
const getAllRolesIdAdmins = require('../../components/getAllRolesIdAdmins')
const api = require('../../api/index')
const getAllRolesIdModers = require('../../components/getAllRolesIdModers')
const parseIdFromMention = require('../../components/parseIdFromMention');
const {numbersServersByGuildId} = require("../../configs/settings");

// const getRecaptchaToken = () => solver.recaptcha("6LdLWdMaAAAAAJI4L3Dp3iV7eB7qerf8p-YyzLoD", "https://arizona-rp.com").then(req => req.data)
//
// const solver = new Captcha.Solver("8442257b4f52799ef9f2f7cce5caaf91");
// const getPlayerToken = async () => axios.post(`https://backend.arizona-rp.com/auth/by-password`, {
//     username: "Andrey_Connect",
//     password: "123123123",
//     serverId: 1,
//     recaptchaToken: await getRecaptchaToken(),
// }).then(req => req.data.accessToken);

module.exports = {
  name: 'find', // название команды
  descr: 'Найти базовую статистику игрока по его никнейму', // описание команды
  archive: false,
  perms: (rolesId) => [
    ...getAllRolesIdAdmins(rolesId),
    ...getAllRolesIdModers(rolesId)
  ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'никнейм-или-пользователь',
      description: 'Игрок по которому Вы хотите получить информацию',
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ], // аргументы

  async run ({ bot, guild, rolesId, args, interaction }) {
    const serverId = numbersServersByGuildId[guild.id];

    const getPlayerNickName = (value) => {
      // Проверяем, является ли переданный пользователь завуалированным упоминанием.
      if (MessageMentions.UsersPattern.test(value)) {
        // Если да, то получаем айди пользователя и самого пользователя соответственно.
        const userId = parseIdFromMention(value)
        const member = guild.members.cache.get(userId)

        // Как только получили пользователя, то убираем все не нужные знаки(если они есть)
        // в нике пользователя и затем передаём его на проверку на НСО
        let nickname = '' // результативный никнейм.
        const splitedPreNickname = member?.nickname.split(']') || [] // разделяем по ] чтобы можно было отсеять среди дискорд формы - ник
        Array.from(splitedPreNickname[splitedPreNickname.length - 1]).map((letter) => {
          // Проходимся по всем символам никнейма. Начиная после тега ранга.
          if (/^[a-zA-Z-_" "]+$/.test(letter)) {
            // проверяем, является ли символ английском.
            nickname += letter // если да, то добавляем его в слово
          } else {
            nickname += ' ' // если нет, то просто ставим пробел. Сделано для того чтобы если знак был между ником, то его было можно легко заменить
          }
        })
        // Если у пользователя вместо нижнего подчёркивания стоит пробел, то заменяем его на нижнее подчёркивание.
        nickname = nickname.trim().replace(' ', '_')

        return nickname;
      }

      // Если это обычная строка а не пинг, то просто возвращаем никнейм который передали.
      return value;
    }

    // получаем никнейм благодаря функции выше
    const nickname = getPlayerNickName(args[0]);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.Blue)
          .setTitle(`⌛ | Загрузка данных...`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL()
          })
          .setDescription(
            `**Происходит процесс загрузки данных.\nВ среднем загрузка данных длится около 3-10 секунд.\nПока идёт загрузка можете сыграть в гляделки с одним из наших котиков.**`
          )
          .setTimestamp()
          .setImage('https://www.cats-british.ru/files/articles/pochemu_koshka_smotrit_v_glaza.jpg')
          .setFooter({
            text: `Surprise Bot`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
    const request = await api.findPlayer(nickname, serverId)
    if (request.error) {
      return interaction.editReply({
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${request.error.includes('not found on server') ? `Игрок с никнеймом \`${nickname}\` не существует на \`${serverId}\` сервере!` : request.error.includes('must have _') ? "Никнейм должен содержать '_'!" : request.error}**`
            )
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Surprise Bot`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    const { isOnline, cash, bank, org, vip, work, rank, deposit, lvl, totalMoney } = request.data
    const format = (number) => new Intl.NumberFormat('en-US').format(number)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({ name: guild.name, iconURL: guild.iconURL() })
          .setTitle(`Информация о пользователе - ${nickname}`)
          .setDescription(`\`\`\`asciidoc\n= Аккаунт =\`\`\`\n>>> **「💾」Никнейм: \`${nickname}\`\n「💎」Статус: \`${!isOnline ? 'Не в сети' : 'В игре'}\`\n「💰」Баланс: \`${format(cash)}$\`\n「🏦」Баланс в банке: \`${format(bank)}$\`\n「💶」Баланс депозита: \`${format(deposit)}$\`\n「🤑」Общее количество денег: \`${format(totalMoney)}$\`\n「👻」Уровень: \`${lvl}\`\n「🔰」VIP: \`${vip ? vip : "Отсутствует"}\`\n「🛠」Работа: \`${work}\`\n「📕」Организация: \`${org ? org : 'Отсутствует'}\`\n${rank ? `「💳」Ранг: \`${rank}\`` : ''}**`)
          // .setColor(Colors.Blue)
          .setColor(Colors.Blue)
          .setFooter({
            text: `Surprise Bot`,
            iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }
}
