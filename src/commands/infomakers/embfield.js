const {
  ApplicationCommandOptionType,
  EmbedBuilder,
  Colors,
} = require("discord.js");
const getAllRolesIdInfoMakers = require("../../components/getAllRolesIdInfomakers");
const InfomakerEmbed = require("../../models/InfomakerEmbed");
module.exports = {
  name: "embfield", // название команды
  descr: "Добавление/редактирование/удаление полей в эмбеде", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: "действие",
      description:
        "Действие которое Вы хотите совершить по отношению к какому-то field'у",
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: `Добавить`,
          value: `add`,
        },
        {
          name: `Удалить`,
          value: `remove`,
        },
        {
          name: `Отредактировать`,
          value: `edit`,
        },
      ],
      required: true,
    },
    {
      name: "номер",
      description:
        "Номер field'a по отношению к которому будут добавлены вправки [ТОЛЬКО ДЛЯ УДАЛЕНИЯ И РЕДАКТИРОВАНИЯ]",
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
  perms: (rolesId) => getAllRolesIdInfoMakers(rolesId), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, guild, channel, author }) => {
    const action = args[0];
    const idField = Number(args[1]);
    const embed =
      (await InfomakerEmbed.findOne({
        infoMakerId: author.id,
        guildId: guild.id,
      })) ||
      new InfomakerEmbed({
        infoMakerId: author.id,
        guildId: guild.id,
        title: "-",
        description: "-",
        color: "#FFFFFF",
        timestamp: "-",
        imageUrl: "-",
        footer: "-",
        imageFooter: "-",
        authorName: "-",
        authorLink: "-",
        authorImageLink: "-",
        urlTitle: "-",
        fields: [],
      });

    if (
      !(await InfomakerEmbed.findOne({
        infoMakerId: author.id,
        guildId: guild.id,
      }))
    ) {
      await embed.save();
    }

    if (action === "remove") {
      const newFields = embed.fields
        .map((field, index) => {
          if (index + 1 === idField) {
            return null;
          }
          return field;
        })
        .filter((field) => Boolean(field));
      await InfomakerEmbed.updateOne(
        {
          infoMakerId: author.id,
          guildId: guild.id,
        },
        {
          fields: newFields,
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Удаление field'a`)
            .setDescription(`**Вы успешно удалили под \`\`${idField}\`\` ID**`)
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

    if (action === "add") {
      const keyQuestionMessage = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Ключ`)
            .setDescription(`**Введите заголовок field'a**`)
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
      const key = (
        await channel.awaitMessages({
          filter: (response) => response.member.id == author.id,
          max: 1,
          time: 600000,
          errors: ["time"],
        })
      ).first();

      const valueQuestionMessage = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Значение`)
            .setDescription(`**Введите значение field'a**`)
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
      const value = (
        await channel.awaitMessages({
          filter: (response) => response.member.id == author.id,
          max: 1,
          time: 600000,
          errors: ["time"],
        })
      ).first();

      valueQuestionMessage.delete();
      keyQuestionMessage.delete();
      key.delete();
      value.delete();

      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          $push: {
            fields: {
              key: key.content,
              value: value.content,
            },
          },
        }
      );
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Добавление field'a`)
            .setDescription(
              `**Вы успешно добавили field.\n Ключ: \`${key}\`\ \n Значение: \`${value}\`**`
            )
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
    if (action === "edit") {
      const keyQuestionMessage = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Ключ`)
            .setDescription(`**Введите новый заголовок field'a**`)
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
      const key = (
        await channel.awaitMessages({
          filter: (response) => response.member.id == author.id,
          max: 1,
          time: 600000,
          errors: ["time"],
        })
      ).first();

      const valueQuestionMessage = await channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Значение`)
            .setDescription(`**Введите новое значение field'a**`)
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
      const value = (
        await channel.awaitMessages({
          filter: (response) => response.member.id == author.id,
          max: 1,
          time: 600000,
          errors: ["time"],
        })
      ).first();

      valueQuestionMessage.delete();
      keyQuestionMessage.delete();
      key.delete();
      value.delete();

      const newFields = embed.fields.map((field, index) => {
        if (index + 1 === idField) {
          return {
            key: key.content,
            value: value.content,
          };
        }
        return field;
      });

      await InfomakerEmbed.updateOne(
        {
          guildId: guild.id,
          infoMakerId: author.id,
        },
        {
          $set: {
            fields: newFields,
          },
        }
      );

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Редактирование field'a`)
            .setDescription(
              `**Вы успешно изменили значение field'a под \`${idField}\` ID.\n Новый заголовок: ${key.content}\n Новое значение: ${value.content}**`
            )
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
  },
};
