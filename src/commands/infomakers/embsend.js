const { EmbedBuilder, Colors } = require("discord.js");
const getAllRolesIdInfoMakers = require("../../components/getAllRolesIdInfomakers");
const InfomakerEmbed = require("../../models/InfomakerEmbed");
module.exports = {
  name: "embsend", // название команды
  descr: "Отправка эмбеда", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [],
  perms: (rolesId) => getAllRolesIdInfoMakers(rolesId), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, guild, channel, author }) => {
    const embed = new EmbedBuilder();
    const settingsEmbed = await InfomakerEmbed.findOne({
      guildId: guild.id,
      infoMakerId: author.id,
    });

    if (!settingsEmbed) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не инициализировали эмбед. (Для каждого пользователя свой эмбед)**`
            )
            .setColor(Colors.Blue)
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

    const {
      title,
      description,
      color,
      fields,
      authorImageLink,
      authorName,
      authorLink,
      footer,
      imageFooter,
      timestamp,
      urlTitle,
      imageUrl,
    } = settingsEmbed;

    if (title !== "-") embed.setTitle(title);
    if (description !== "-") embed.setDescription(description);
    embed.setColor(parseInt(color.slice(1), 16));
    if (fields.length > 0)
      embed.addFields(
        fields.map((field) => {
          return {
            name: `${field.key}`,
            value: `${field.value}`,
          };
        })
      );
    if (urlTitle !== "-") embed.setURL(urlTitle);
    if (authorName !== "-") embed.setAuthor({
      name: authorName,
    });
    if (authorName !== "-" && authorLink !== "-")
      embed.setAuthor({
        name: authorName,
        url: authorLink,
      });
    if (authorName !== "-" && authorLink !== "-" && authorImageLink !== "-")
      embed.setAuthor({
        name: authorName,
        url: authorLink,
        iconURL: authorImageLink
      });
    if (imageUrl !== "-") embed.setImage(imageUrl);
    if (footer !== "-" && imageFooter == "-")
      embed.setFooter({
        text: footer,
      });
    if (imageFooter !== "-" && footer !== "-")
      embed.setFooter({
        text: footer,
        iconURL: imageFooter,
      });
    if (timestamp !== "-") embed.setTimestamp();
    channel
      .send({
        embeds: [embed],
      })
      .catch(() => {
        console.log(err);
        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Упс.. Что-то пошло не так. Скорее всего, Вы что-то не так указали**`
              )
              .setColor(Colors.Blue)
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
      });
  },
};
