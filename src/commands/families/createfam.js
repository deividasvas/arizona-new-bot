const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  Colors,
} = require("discord.js");
const { rolesId } = require("../../configs/settings");
const settings = require("../../configs/settings");
const { ChannelType } = require("discord.js");
const Families = require("../../models/Families");

module.exports = {
  name: "createfam", // название команды
  descr: "Создать семью", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  perms: () => [rolesId.discordMaster, rolesId.juniorDiscordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
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

  async run({ bot, interaction, args, guild, author }) {
    const familyName = args[2]; // Название семьи
    const color = args[1]; // Цвет семьи
    const leaderFam =
      guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
    const family = await Families.findOne({
      $or: [
        {
          ownerId: leaderFam.id,
        },
        {
          deputies: {
            $in: [
              {
                userId: leaderFam.id,
              },
            ],
          },
        },
      ],
    }); // делаем поиск уже существующей семьи в которой есть данный чел

    if (family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**${leaderFam} уже является лидером или заместителем семьи \`${familyName}\`**`
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

    let role = await guild.roles.create({
      name: familyName,
      color,
      permision: [],
      position: (await guild.roles.fetch(settings.rolesId.fams)).position - 1,
    }); // создание самой роли
    await guild.channels.cache
      .find((channel) => channel.id === settings.channelsId.famGeneral)
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
          .setColor(Colors.DarkGreen)
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

    let logChannel = bot.channels.cache.get(settings.channelsId.famLogs); // Лог семей

    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
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
    const voiceChannel = await guild.channels.create(`${familyName}`, {
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
          id: settings.rolesId.everyone,
          deny: ["ViewChannel"],
        },
      ],
      reason: "Создан канал для семей",
      parent: settings.categories.fams,
    });

    // Создание текстового канала
    const textChannel = await guild.channels.create(`${familyName}`, {
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
          id: settings.rolesId.everyone,
          deny: ["ViewChannel"],
        },
      ],
      reason: "Создан канал для семей",
      parent: settings.categories.fams,
    });
    const newFamily = new Families({
      ownerId: leaderFam.id,
      deputies: [],
      roleId: role.id,
      voiceChannelId: voiceChannel.id,
      textChannelId: textChannel.id,
    });
    await newFamily.save();

    bot.reInitPermissionsForFamilies(); // ОБНОВЛЕНИЕ ПРАВ ДЛЯ ВСЕХ СЕМЕЙНЫХ КОМАНД, СДЕЛАНО ЧТОБ ПРАВА ПРИМЕНИЛИСЬ К НОВЫМ СЕМЬЯМ. НЕ ТРОГАТЬ!!!!!

  },
};
