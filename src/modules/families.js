const { EmbedBuilder, Colors } = require("discord.js");
const getAllRolesIDAdmins = require("../components/getAllRolesIDAdmins");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы обработать приглашение в семью у которого истёк срок. У приглашения в команде
    faminvite есть срок, это два часа, после двух часов оно не работает, данный модуль смотрит прошло ли 2 часа, и если
    прошло, то отправляет что уже прошло 2 часа, и нужно по новой отправить приглашение.
  */
  name: "families", // имя модуля
  acceptCustomsID: ["fam_yes", "fam_no"], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot, interaction, user, guild, message }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

    const hours = (new Date() - message.createdTimestamp) / 3600000;
    if(hours > 2){
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Уже прошло более 2 часов с момента отправки приглашения. Попросите отправить новое приглашение**`
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
  },
};
