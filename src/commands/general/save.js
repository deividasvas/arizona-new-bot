const { EmbedBuilder } = require("discord.js");
const { rolesId, channelsId } = require("../../configs/settings");

module.exports = {
  name: "save", // название команды
  descr: "Информация о том как можно защитить свой аккаунт.", // описание команды
  private: false, // ограничена в использовании
  arguments: [], // аргументы
  perms: () => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду


  run: async ({ bot, interaction, args, guild }) => {
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setTitle(`📌 | Информация`)
          .addFields(
            {
              name: `**❗・Шаг 1**`,
              value: `**Зайдите в игру и настройках своего личного аккаунта вам потребуется привязать почту. Лучше всего вам создавать почту на gmail.com.**`,
              inline: false,
            },
            {
              name: `**❗・Шаг 2**`,
              value: `**Далее вам придётся скачать приложение на свой смартфон и установить на него приложение Google Authenticator. Далее зайдя в игру в настройках, установить вход на аккаунт при помощи Google Authenticator.**`,
              inline: false,
            },
            {
              name: `**❗・Шаг 3**`,
              value: `**Далее в настройках так же вам потребуется установить вход по почте на ваш аккаунт.**`,
              inline: false,
            },
            {
              name: `**❗・Шаг 4**`,
              value: `**Если, вы зарегистрировали свою почту на gmail.com, то в настройках в личного кабинете вашей почты, вы можете установить вход на аккаунт через Google Authenticator.**`,
              inline: false,
            },
            {
              name: `**❗・Шаг 5**`,
              value: `**Храните пароль от своей почты только на вашем телефоне и заходите на почту через предложение gmail.com.**`,
              inline: false,
            },
            {
              name: `**❗・Шаг 6**`,
              value: `**Если вы привяжите в личном кабинете на сайте Проекта Arizona Games свой аккаунт к странице в ВК, то это вам даст возможность восстановить свой игровой аккаунт через Тех.Поддержку.\nСсылка на личный кабинет Arizona Games: https://arizona-rp.com/profile/in**`,
              inline: false,
            }
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
  },
};
