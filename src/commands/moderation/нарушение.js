const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const { rolesId, channelsId } = require("../../configs/settings");

module.exports = {
  name: "нарушение", // название команды
  descr: "Пожаловаться следящим о нарушении руководящего состава", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [
    {
      name: "структура",
      description:
        "Структура в которой находится нарушитель(ЦА | МЮ | МО | МЗ | СМИ)",
      type: ApplicationCommandOptionType.String,
      choices: [
        // подсказки к аргументу
        {
          name: "ЦА",
          value: `ЦА`,
        },
        {
          name: "МЮ",
          value: `МЮ`,
        },
        {
          name: "МО",
          value: `МО`,
        },
        {
          name: "МЗ",
          value: `МЗ`,
        },
        {
          name: "СМИ",
          value: `СМИ`,
        },
      ],
      required: true,
    },
    {
      name: "нарушитель",
      description: "Член руководящего состава который нарушил правила",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "жалоба",
      description:
        "Что сделал такого член руководящего состав за что его стоит наказать",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "доказательства",
      description: "Доказательства Ваших слов",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы
  perms: () => {
    return getAllRolesIdModers(); // все модерские роли
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const structure = args[0]; // структура
    const violatorId = args[1]; // нарушитель
    const textComplaint = args[2]; // суть жалобы
    const proof = args[3]; // доказательства

    const validsStructures = ["ЦА", "МЮ", "МО", "МЗ", "СМИ"]; // все валидные структуры для первого аргумента.
    if (!validsStructures.includes(structure.toUpperCase())) {
      // проверяем, есть ли структура среди валидных структур
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Структура \`${structure}\` которую Вы указали не является валидной.\nВалидные структуры: ${validsStructures.join(
                ", "
              )}**`
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
    if (textComplaint.length < 5 || textComplaint.length > 1300) {
      // проверяем меньши ли текст 5 символов и не более ли чем 1300.
      // если больше или меньше, то выдаём ошибку.
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `Суть жалобы должна быть не менее 5 символов, и не более 1300 символов`
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

    const punishChannel = guild.channels.cache.get(
      channelsId.punishLeadership
    ); // канал с нарушениями рук.состава
    let spectatorRoleId = ""; // ID роли следящих которых нужно пинговать
    switch (structure) {
      case "ЦА":
        spectatorRoleId = rolesId.spectatorGov;
        break;
      case "МЮ":
        spectatorRoleId = rolesId.spectatorPolice;
        break;
      case "МО":
        spectatorRoleId = rolesId.spectatorArmy;
        break;
      case "МЗ":
        spectatorRoleId = rolesId.spectatorHealth;
        break;
      case "СМИ":
        spectatorRoleId = rolesId.spectatorRadio;
    }
    punishChannel.send({
      content: `<@&${rolesId.mainSpectatorsState}> <@&${rolesId.spectatorState}> <@&${spectatorRoleId}>`,
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: `📌 | Жалоба на руководство`,
            iconURL: guild.iconURL(),
          })
          .addFields(
            { name: `Пожаловался:`, value: `${author}`, inline: false },
            { name: `Нарушитель:`, value: `<@${violatorId}>`, inline: false },
            { name: `Обращение:`, value: `${textComplaint}`, inline: false },
            { name: `Доказательства:`, value: `${proof}`, inline: false }
          )
          .setColor(`Red`)
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle(`📌 | Жалоба на руководство`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно отправили жалобу <@&${spectatorRoleId}> на пользователя <@${violatorId}> с следующей сутью: \`\ ${textComplaint} \`. Были прикреплены следующие доказательства: \`${proof}\` \ **`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
