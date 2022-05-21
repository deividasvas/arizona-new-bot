const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "server-info", // название команды
  descr: "Информация по контактам руководства сервера, соц.сетям сервера", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, args, guild }) => {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(0x3376ca)
          .setThumbnail(`https://samp-servers.ru/images/projects/1.jpg`)
          .setTitle(`**Информация по Arizona Role Play Surprise**`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          })
          .setDescription(
            "```asciidoc\n= Социальные сети - VK = ```\n" +
              "**● Официальная Группа - <https://vk.com/surprize_official>**\n" +
              "```asciidoc\n= Видеохостинги - YouTube = ```\n" +
              "**● Официальный канал - https://www.youtube.com/channel/UCntJ0a9jpP-1B66fQBLZ6fA**\n\n" +
              "```asciidoc\n= Социальные сети  - Discord = ```\n" +
              "**● Discord Server - https://discord.gg/arz-surprise**\n" +
              "**● Discord Server Нелегалов - https://discord.gg/N5QKT9m**"
          )
          .addFields([
            {
              name: `**⚄ Страница Главного Администратора:\nAleksandr_Rencov**`,
              value: `<https://vk.com/ren_c_c>`,
            },
            {
              name: `**⚄ Страница Зам.Главного Администратора:\nSebastian_Disney**`,
              value: `<https://vk.com/s_disney>`,
            },
            {
              name: `**Страница Куратора:\nTommyk_Krystall**`,
              value: `<https://vk.com/xxl_iwi_lxx>`,
              inline: true,
            },
            {
              name: `**Страница Куратора:\nIngramm_Savage**`,
              value: `<https://vk.com/kryhovyak7>`,
              inline: true,
            }
          ]),
      ],
    });
  },
};
