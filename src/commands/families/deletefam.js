const {
  EmbedBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  Colors,
} = require("discord.js");
const { rolesId } = require("../../configs/settings");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "deletefam", // название команды
  descr: "Удалить семью", // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  perms: () => [rolesId.discordMaster, rolesId.juniorDiscordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "семья",
      description: "Роль семьи которую нужно удалить",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ], // аргументы

  async run({ bot, interaction, args, guild, author }){
    const familyRoleID = args[0]; // Семья
    const family = await Families.findOne({
      roleId: familyRoleID,
    });
    if (!family) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Данной семьи не существует**`)
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
    let voiceChannel = guild.channels.cache.find(
      (channel) =>
        channel.id == family.voiceChannelId &&
        channel.type === ChannelType.GuildVoice
    ); // Голосовой канал

    let textChannel = guild.channels.cache.find(
      (channel) =>
        channel.id == family.textChannelId &&
        channel.type === ChannelType.GuildText
    ); // Текстовый канал

    let role = guild.roles.cache.find((role) => role.id === family.roleId); // Роль
    voiceChannel.delete(); // Удаление голосового канала
    textChannel.delete(); // Удаление текстового канала
    role.delete(); // Удаление роли
    let owner = bot.users.cache.get(`${family.ownerId}`);
    let logChannel = bot.channels.cache.get(settings.channelsId.famLogs); // Лог семей
    logChannel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xff4040)
          .setTitle(`📌 | Удаление семьи!`)
          .setDescription(
            `**「📝」Семья: \`\`${role.name}\`\`\\n「📌」Лидер: ${owner.tag} \`[${owner.id}]\`\n「👪」Семью удалил Администратор: \`${author.user.tag}**`
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
      roleId: familyRoleID,
    });
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Удаление семьи!`)
          .setDescription(`**Вы успешно удалили семью \`\`${role.name}\`\`**`)
          .setColor(Colors.Red)
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
    bot.reInitPermissionsForFamilies(); // ОБНОВЛЕНИЕ ПРАВ ДЛЯ ВСЕХ СЕМЕЙНЫХ КОМАНД, СДЕЛАНО ЧТОБ ПРАВА ПРИМЕНИЛИСЬ К НОВЫМ СЕМЬЯМ. НЕ ТРОГАТЬ!!!!!
  },
};
