const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const sendUserMessage = require("../../components/sendUserMessage");
const settings = require("../../configs/settings");
const { rolesID } = require("../../configs/settings");

module.exports = {
  name: "famkick", // название команды
  descr: "Исключить человека из семьи", // описание команды
  private: false, // общедоступность команды
  arguments: [
    {
      name: "пользователь",
      description: "Пользователь который будет исключен из семьи",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ], // список аргументов
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  run: async ({ bot, interaction, channel, author, args, guild }) => {
    const family = (
      await bot.connection(
        `SELECT * FROM \`families\` WHERE \`owner_id\` = "${author.id}" OR \`zam_id\` = ${author.id} `
      )
    )[0];
    const familyCandidateForKick =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не являетесь владельцем или заместителем семьи**`
            )
            .setColor(`RED`)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    if (author.id === familyCandidateForKick.id) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Невозможно исключить самого себя из семьи**`)
            .setColor(`RED`)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    if (
      !familyCandidateForKick.roles.cache.some(
        (role) => role.id === family.role_id
      )
    ) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${familyCandidateForKick} не состоит в Вашей семье**`
            )
            .setColor(`RED`)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }

    familyCandidateForKick.roles.remove(family.role_id);
    const logFamiliesChannel = guild.channels.cache.get(
      settings.channelsID.famLogs
    ); // лог семей
    logFamiliesChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#39FE7B")
          .setTitle(`📌 | Исключение из семьи!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Семья: <@&${family.role_id}>\n「📌」Лидер: ${author} \`[${
              author.id
            }]\`${
              family.zam_id !== "0"
                ? `\n「🧍‍♂️」Заместитель семьи: <@${family.zam_id}>`
                : ""
            }\n「👪」Исключили: ${familyCandidateForKick} \`[${
              familyCandidateForKick.id
            }]\`**`
          )
          .setFooter({
            text: "Robo Hamster",
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    const role = guild.roles.cache.find((role) => role.id === family.role_id);
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("DARK_GREEN")
          .setTitle(`📌 | Исключение из семьи!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы успешно исключили ${familyCandidateForKick} из семьи \`\`${role.name}\`\` **`
          )
          .setFooter({
            text: "Robo Hamster",
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setColor("DARK_GREEN")
          .setTitle(`📌 | Исключение из семьи!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**Вы были исключены из семьи \`\`${role.name}\`\` её руководителем ${author}**`
          )
          .setFooter({
            text: "Robo Hamster",
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    }, familyCandidateForKick.id, guild);
  },
};
