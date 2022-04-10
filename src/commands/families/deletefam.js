const { EmbedBuilder, ApplicationCommandOptionType, ChannelType } = require("discord.js");
const { rolesID } = require("../../configs/settings");
const settings = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "deletefam", // название команды
  descr: "Удалить семью", // описание команды
  private: false, // ограничена в использовании
  perms: () => [rolesID.discordMaster, rolesID.juniorDiscordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  arguments: [
    {
      name: "семья",
      description: "Роль семьи которую нужно удалить",
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ], // аргументы

  run: async ({ bot, interaction, args, guild, author }) => {
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
    let voiceChannel = guild.channels.cache.find(
      (channel) =>
        channel.id == family.voiceChannelId && channel.type === ChannelType.GuildVoice
    ); // Голосовой канал

    let textChannel = guild.channels.cache.find(
      (channel) =>
        channel.id == family.textChannelId && channel.type === ChannelType.GuildText
    ); // Текстовый канал

    let role = guild.roles.cache.find((role) => role.id === family.roleId); // Роль
    voiceChannel.delete(); // Удаление голосового канала
    textChannel.delete(); // Удаление текстового канала
    role.delete(); // Удаление роли
    let owner = bot.users.cache.get(`${family.ownerId}`);
    let logChannel = bot.channels.cache.get(settings.channelsID.famLogs); // Лог семей
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
    })
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Удаление семьи!`)
          .setDescription(`**Вы успешно удалили семью \`\`${role.name}\`\`**`)
          .setColor(`Red`)
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
