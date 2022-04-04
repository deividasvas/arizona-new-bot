const { EmbedBuilder } = require("discord.js");
const { rolesID, channelsID } = require("../../configs/settings");

module.exports = {
  name: "server-info", // название команды
  descr:
    "Информация по контактам руководства сервера, соц.сетям сервера", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: () => [rolesID.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

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
              "**● Официальная Беседа - <https://vk.cc/9EYvW1>**\n\n" +
              "```asciidoc\n= Видеохостинги - YouTube = ```\n" +
              "**● Официальный канал - https://www.youtube.com/channel/UCARjgbeXTEnJ0CnE_sfozMw/featured?view_as=subscriber**\n\n" +
              "```asciidoc\n= Социальные сети  - Discord = ```\n" +
              "**● Discord Server - https://discord.gg/arz-surprise**\n" +
              "**● Discord Server Нелегалов - https://discord.gg/N5QKT9m**"
          )
          .addField(
            `**⚄ Страница Главного Администратора:\nAleksandr_Rencov**`,
            `<https://vk.com/ren_c_c>`
          )
          .addField(
            `**⚄ Страница Зам.Главного Администратора:\nSebastian_Disney**`,
            `<https://vk.com/s_disney>`
          )
          .addField(
            `**Страница Куратора:\nTommyk_Krystall**`,
            `<https://vk.com/xxl_iwi_lxx>`,
            true
          )
          .addField(
            `**Страница Куратора:\nIngramm_Savage**`,
            `<https://vk.com/kryhovyak7>`,
            true
          ),
      ],
    });
  },
};
