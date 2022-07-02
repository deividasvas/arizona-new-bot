const {
  EmbedBuilder,
  Colors,
  ButtonStyle,
} = require("discord.js");
const {
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");

module.exports = {
  name: "bshop", // название команды
  descr: "Магазин плюшек для модерации", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  async run({ bot, interaction, author, guild, channelsId, theSlashCall }) {
    const moderator = await getModerInfo(bot, guild.id, author.id);
    if (moderator.error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                  `**Вы не являетесь модератором. Если это не так, то обратитесь к технической поддержке Вашего сервера**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Surprise Bot`,
                iconURL: bot.user.displayAvatarURL(),
              }),
        ],
      });
    }

    const { main: {balls} } = moderator;

    const embed = new EmbedBuilder()
      .setTitle("📌 | Магазин для модерации!")
      .setDescription(
        `**\`\`\`\nВаш баланс: ${balls} балла(ов)\`\`\`\n\`\`\`\nПредметы для покупки\`\`\`\n\`1\` Снять выговор - \`100\` баллов(👾)\n\`2\` Купить 10 лвл (rank) - \`150\` баллов(⭐)\n\`2.1\` Купить 20 лвл (rank) - \`280\` баллов(🌟)\n\`2.2\` Купить 30 лвл (rank) - \`400\` баллов(✨)\n\`3\` Получит иммунитет - \`120\` баллов(🏅)\n\`4\` Купить x2 Баллы - \`250\` баллов(🥈)\n\`5\` Купить х3 Баллы - \`500\` баллов(🥉)\n\`6\` Купить персональную роль на две недели - \`250\` баллов(💥)**`
      )
      .setColor(Colors.Blue)
      .setTimestamp()
      .setFooter({
        text: `Surprise Bot`,
        iconURL: bot.user.displayAvatarURL(),
      })
      .setAuthor({
        name: `Surprise Bot`,
        iconURL: guild.iconURL(),
      }); // эмбед который мы будем отправлять модераторам
    const components = [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`bshopMinusRebuke`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `👾`,
          }),
        new ButtonBuilder()
          .setCustomId(`bshop10level`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `⭐`,
          }),
        new ButtonBuilder()
          .setCustomId(`bshop20level`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `🌟`,
          }),
        new ButtonBuilder()
          .setCustomId(`bshop30level`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `✨`,
          }),
        new ButtonBuilder()
          .setCustomId(`bshopImun`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `🏅`,
          })
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`bshopX2balls`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `🥈`,
          }),
        new ButtonBuilder()
          .setCustomId(`bshopX3balls`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `🥉`,
          }),
        new ButtonBuilder()
          .setCustomId(`bshopRole`)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji({
            name: `💥`,
          }),
      ),
    ]; // кнопочки

    if (theSlashCall) {
      // если вызов команды произошёл через слэш, то отдаём прямо в ответ сообщение с магазином.
      return interaction.reply({
        ephemeral: true,
        embeds: [embed],
        components,
      });
    }

    try {
      // если это вызов через обычную команду, то нужно отправить сначала человеку в лс эмбед
      author.send({
        embeds: [embed],
        components,
      });
      // пробуем.
    } catch (e) {
      // если не удаётся отправить человеку в лс, из-за того что возможно он заблокал бота или лс закрыта
      // тогда мы отправляем сообщение прямо в модерский канал
      const moderationChannel = guild.channels.cache.get(channelsId.moderation);
      moderationChannel.send({
        embeds: [embed],
        components,
      });
    }
  },
};
