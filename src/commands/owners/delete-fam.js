const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  Colors,
} = require("discord.js");
const Families = require("../../models/Families");
const sendUserMessage = require("../../components/sendUserMessage");
const log = require("../../components/log");

module.exports = {
  name: "delete-fam", // название команды
  descr: "Удалить семью", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "семья",
      description: "Роль семьи которую нужно удалить",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ], // аргументы

  async run({ bot, interaction, args, guild, author, rolesId, channelsId, categories}){
    const familyRoleId = args[0]; // Семья
    const family = await Families.findOne({
      roleId: familyRoleId,
    });
    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Данной семьи не существует**`)
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
    let voiceChannel = guild.channels.cache.find(
      (channel) =>
        channel.id === family.voiceChannelId &&
        channel.type === ChannelType.GuildVoice
    ); // Голосовой канал

    let textChannel = guild.channels.cache.find(
      (channel) =>
        channel.id === family.textChannelId &&
        channel.type === ChannelType.GuildText
    ); // Текстовый канал

    let role = guild.roles.cache.find((role) => role.id === family.roleId); // Роль
    voiceChannel.delete(); // Удаление голосового канала
    textChannel.delete(); // Удаление текстового канала
    role.delete(); // Удаление роли
    let owner = bot.users.cache.get(`${family.ownerId}`);
    let logChannel = bot.channels.cache.get(channelsId.famLogs); // Лог семей
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xff4040)
          .setTitle(`📌 | Удаление семьи!`)
          .setDescription(
            `**「📝」Семья: \`\`${role.name}\`\`\ \n「📌」Лидер: ${owner.tag} \`[${owner.id}]\`\n「👪」Семью удалил Администратор: \`${author.user.tag}\`**`
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
    await Families.deleteOne({
      roleId: familyRoleId,
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Удаление семьи!`)
          .setDescription(`**Вы успешно удалили семью \`\`${role.name}\`\`**`)
          .setColor(Colors.Blue)
          .setTimestamp()
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
    await sendUserMessage({
      embeds: [
        await new EmbedBuilder()
            .setTitle("📌 | Утрата возможности!")
            .setDescription(
                `**Администратор ${author} удалил Вашу семью под названием \`${role.name}\`**`
            )
            .setColor(Colors.Blue)
            .setTimestamp()
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            })
      ]
    }, family.ownerId, guild);
    const leaderFam = guild.members.cache.get(family.ownerId);
    log(25, {
      guildId: guild.id, // ID сервера
      discordId: leaderFam.id, // ID упомянутого участника
      discordTag: leaderFam.user.tag, // Tag упомянутого участника
      discordNick: leaderFam.displayName, // Серверный ник упомянутого участника
      moderatorId: author.id, // ID автора сообщения
      moderatorTag: author.user.tag, // Tag автора сообщения
      moderatorNick: author.displayName, // Серверный ник автора сообщения
      roleName: role.name,
      roleId: role.id,
      channelName: textChannel.name,
      channelId: textChannel.id,
      value: role.name
    })
  },
};
