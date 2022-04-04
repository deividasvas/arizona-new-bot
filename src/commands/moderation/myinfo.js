const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllRolesIDModers = require("../../components/getAllRolesIDModers");
const getModerInfo = require("../../components/getModerInfo");
const sendUserMessage = require("../../components/sendUserMessage");
const { rolesID, channelsID } = require("../../configs/settings");

module.exports = {
  name: "myinfo", // название команды
  descr: "Узнать модерскую статистику по выданным наказаниям", // описание команды
  private: false, // ограничена в использовании
  arguments: [
    {
      name: "пользователь",
      description: "Модератор которого Вы хотите проверить статистику",
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ], // аргументы
  perms: () => {
    return getAllRolesIDModers(); // все модерские роли
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args }) => {
    /* пользователь которого модерскую стату мы будем смотреть.
    либо пользователь который передан первым аргументом, либо автор сообщения.
    */
    const moderator = args[0]
      ? guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]))
      : author;
    const { week, main, error } = await getModerInfo(bot, guild, moderator.id); // запрашиваем модерскую статистику за неделю и за всё время у бд
    if (error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${args[0] ? "Пользователь не является" : "Вы не являетесь"} модератором. Если это не так, то обратитесь к <@&${rolesID.techSection}>**`
            )
            .setColor(`Red`)
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
    console.log(moderator);
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("#ff3838")
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setTitle(
            `Профиль: \`${moderator.nickname || moderator.user.tag}[${
              main.balls
            }][${week.balls}]\``
          )
          .setThumbnail(
            `${moderator.user.displayAvatarURL({
              format: "png",
              size: 2048,
              dynamic: true,
            })}`
          )
          //\nКрасных предупреждений: \`${warns}\`
          .setDescription(
            `**Кол-во снятых ролей: \`${main.roles}[${week.roles}]\`\nКол-во тикетов: \`${main.tickets}[${week.tickets}]\`\nКол-во выданых банов \`${main.bans}[${week.bans}]\`\nКол-во выданых мутов \`${main.mutes}[${week.mutes}]\`\nКол-во хороших оценок \`${main.goodAnswers}[${week.goodAnswers}]\`\nКол-во плохих оценок \`${main.toxicAnswers}[${week.toxicAnswers}]\`\nКол-во киков: \`${main.kicks}[${week.kicks}]\`\n**`
          )
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
