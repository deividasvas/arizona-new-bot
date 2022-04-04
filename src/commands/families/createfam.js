const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { rolesID } = require("../../configs/settings");
const settings = require("../../configs/settings");
const { ChannelType } = require("discord.js");

module.exports = {
  name: "createfam", // название команды
  descr: "Создать семью", // описание команды
  private: false, // ограничена в использовании
  perms: () => [rolesID.discordMaster, rolesID.juniorDiscordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "владелец",
      description: "Владелец семьи которая будет создана",
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "цвет",
      description: "Цвет роли семья которая будет создана",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "название",
      description: "Название семьи которая будет создана",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ], // аргументы

  run: async ({ bot, interaction, args, guild, author }) => {
    const familyName = args[2]; // Название семьи
    const color = args[1]; // Цвет семьи
    const leaderFam =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const owner = (
      await bot.connection(
        `SELECT * FROM \`families\` WHERE \`owner_id\` = '${leaderFam.id}'`
      )
    )[0];
    const deputy = await (
      await bot.connection(
        `SELECT * FROM \`families\` WHERE \`zam_id\` = '${leaderFam.id}'`
      )
    )[0];

    if (owner) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${leaderFam} уже является лидером семьи \`${familyName}\`**`
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

    if (deputy) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${leaderFam} уже является заместителем семьи \`${familyName}\`**`
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

    let checking = await guild.roles.cache.find(
      (role) => role.name === familyName
    );
    if (checking) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Семья \`${checking.name}\` уже существует!**`)
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

    let role = await guild.roles.create({
      name: familyName,
      color,
      permision: [],
      position: (await guild.roles.fetch(settings.rolesID.fams)).position - 1,
    }); // создание самой роли
    await guild.channels.cache
      .find((channel) => channel.id === settings.channelsID.famGeneral)
      .permissionOverwrites.create(role, {
        ViewChannel: true,
        EmbedLinks: true,
        AttachFiles: true,
        ReadMessageHistory: true,
        UseExternalEmojis: true,
        AddReactions: true,
      }); // добавление прав для общения семей

    guild.members.cache.get(leaderFam.id).roles.add(role);

    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor("#39FE7B")
          .setTitle(`📌 | Создание семьи`)
          .setDescription(
            `**Название: \`${familyName}\`\nВладелец семьи: ${leaderFam}\n**`
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

    let log_channel = bot.channels.cache.get(settings.channelsID.famLogs); // Лог семей

    log_channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#39FE7B")
          .setTitle(`📌 | Создание семьи`)
          .setDescription(
            `**「📝」Название: \`${familyName}\`\n「📌」Владелец семьи: ${leaderFam}\n「👪」Семью создал Администратор: \`${author.user.tag}\`**`
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

    // Создание голосового канала
    const voice_channel = await guild.channels.create(`${familyName}`, {
      type: ChannelType.GuildVoice,
      permissionOverwrites: [
        {
          id: leaderFam.id,
          allow: [
            "ViewChannel",
            "Connect",
            "Speak",
            "PrioritySpeaker",
            "DeafenMembers",
            "MuteMembers",
          ],
          deny: ["Administrator", "CreateInstantInvite"],
        },
        {
          id: role.id,
          allow: ["ViewChannel", "Connect", "Speak"],
          deny: ["Administrator"],
        },
        {
          id: settings.rolesID.everyone,
          deny: ["ViewChannel"],
        },
      ],
      reason: "Создан канал для семей",
      parent: settings.categories.fams,
    });

    // Создание текстового канала
    const text_channel = await guild.channels.create(`${familyName}`, {
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: leaderFam.id,
          allow: ["ViewChannel", "ReadMessageHistory", "ManageMessages"],
          deny: ["Administrator"],
        },
        {
          id: role.id,
          allow: [
            "ViewChannel",
            "ReadMessageHistory",
            "UseExternalEmojis",
            "AddReactions",
            "AttachFiles",
            "EmbedLinks",
          ],
          deny: ["Administrator", "ManageMessages"],
        },
        {
          id: settings.rolesID.everyone,
          deny: ["ViewChannel"],
        },
      ],
      reason: "Создан канал для семей",
      parent: settings.categories.fams,
    });
    await bot.connection(
      `INSERT INTO \`families\` (\`id\`, \`owner_id\`, \`zam_id\`, \`role_id\`, \`voice_channel_id\`, \`text_channel_id\`) VALUES (NULL, '${leaderFam.id}', '0', '${role.id}', '${voice_channel.id}', '${text_channel.id}')`
    );
    bot.reInitPermissionsForFamilies(); // ОБНОВЛЕНИЕ ПРАВ ДЛЯ ВСЕХ СЕМЕЙНЫХ КОМАНД, СДЕЛАНО ЧТОБ ПРАВА ПРИМЕНИЛИСЬ К НОВЫМ СЕМЬЯМ. НЕ ТРОГАТЬ!!!!!
  },
};
