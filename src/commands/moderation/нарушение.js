const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDModers = require("../../components/getAllRolesIDModers");
const { rolesID, channelsID } = require("../../configs/settings");

module.exports = {
  name: "нарушение", // название команды
  descr: "Пожаловаться следящим о нарушении руководящего состава", // описание команды
  private: false, // ограничена в использовании
  arguments: [
    {
      name: "структура",
      description:
        "Структура в которой находится нарушитель(ЦА | МЮ | МО | МЗ | СМИ)",
      type: ApplicationCommandOptionType.String,
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
    return getAllRolesIDModers(); // все модерские роли
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel }) => {
    const structure = args[0]; // структура
    const textComplaint = args[1]; // суть жалобы
    const proof = args[2]; // доказательства

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

    const punishChannel = guild.channels.cache.get(channelsID.punishLeadershipChannel); // канал с нарушениями рук.состава
    let spectator = ""; // следящие которых нужно пинговать
    switch(structure){
        case "ЦА":
            spectator = rolesID.spectatorGov;
            break;
        case "МЮ":
            spectator = rolesID.spectatorPolice
            break;
        case "МО":
            spectator = rolesID.spectatorArmy
            break;
        case "МЗ":
            spectator = rolesID.spectatorHealth
            break;
        case "СМИ":
            spectator = rolesID.spectatorRadio
    }
    punishChannel.send({
        content: `<@&${rolesID.mainSpectatorsState}> <@&${rolesID.spectatorState}> <@&${spectator}>`
    })
  },
};
