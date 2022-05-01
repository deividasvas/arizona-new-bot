const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getAllrolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const { rolesId, channelsId } = require("../../configs/settings");

module.exports = {
  name: "myinfo", // название команды
  descr: "Узнать модерскую статистику по выданным наказаниям", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: "пользователь",
      description: "Модератор которого Вы хотите проверить статистику",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ], // аргументы
  perms: () => {
    return getAllrolesIdModers(); // все модерские роли
  }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    /* Пользователь которого модерскую стату мы будем смотреть.
    Либо пользователь который передан первым аргументом, либо автор сообщения.
    */
    const member = args[0]
      ? guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]))
      : author;
    const { week, main, error, warns } = await getModerInfo(
      bot,
      guild.id,
      member.id
    ); // запрашиваем модерскую статистику за неделю и за всё время у бд
    if (error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                  `**${
                      args[0] ? `Пользователь ${member} не является` : "Вы не являетесь"
                  } модератором. Если это не так, то обратитесь к <@&${
                      rolesId.techSection
                  }>**`
              )
              .setColor(Colors.Red)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
        ],
      });
    }
    const countWarns = warns.filter((warn) => warn.group === "warn").length; // получаем количество всех варнов
    const countRebukes = warns.filter((warn) => warn.group === "rebuke").length; // получаем количество всех выговоров

    interaction.reply({
      ephemeral: channelsId.moderation !== channel.id, // если это модерский, то для всех, если не модерский, то только для чела который отправил команду
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkRed)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setTitle(
            `Профиль: \`${
              member.nickname || member.user.tag
            }[${main.balls.toFixed(2)}][${week.balls.toFixed(2)}]\``
          )
          .setThumbnail(
            `${member.user.displayAvatarURL({
              format: "png",
              size: 2048,
              dynamic: true,
            })}`
          )
          .setDescription(
            `>>> **Кол-во снятых ролей: \`${main.roles}[${week.roles}]\`\nКол-во тикетов: \`${main.tickets}[${week.tickets}]\`\nКол-во выданых банов \`${main.bans}[${week.bans}]\`\nКол-во выданых мутов \`${main.mutes}[${week.mutes}]\`\nКол-во хороших оценок \`${main.goodAnswers}[${week.goodAnswers}]\`\nКол-во плохих оценок \`${main.toxicAnswers}[${week.toxicAnswers}]\`\nКол-во киков: \`${main.kicks}[${week.kicks}]\`\n\nВыговоры: \`${countRebukes}\`\nПредупреждения: \`${countWarns}\`\nИммунитеты: \`${main.immunities}\`\nКоэффицент баллов: \`X${main.coefficient}\`**`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
