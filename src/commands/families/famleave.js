const { EmbedBuilder } = require("discord.js");
const getAllRolesIDFamilies = require("../../components/getAllRolesIDFamilies");
const { rolesID } = require("../../configs/settings");
const Families = require("../../models/Families");

module.exports = {
  name: "famleave", // название команды
  descr: "Покинуть семью", // описание команды
  private: false, // общедоступность команды
  arguments: [], // список аргументов
  perms: (bot) => {
    return getAllRolesIDFamilies(bot); // все айди семейных ролей
  }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
  run: async ({ bot, interaction, channel, author, args, guild }) => {
    const familyList = await Families.find();
    const familyRolesMap = familyList.map((r) => r.roleId); // Получаем название всех семей
    let userFamilysString = "";
    let userFamilyCount = 0;
    let userFamilys = [];
    let currentUser = await guild.members.fetch(author.id);

    for (let i of currentUser._roles) {
      let familyRole = guild.roles.cache.get(i);

      if (familyRolesMap.includes(familyRole.id)) {
        userFamilys.push(familyRole.name);
      }
    }

    for (let i = 0; i < userFamilys.length; i++) {
      userFamilysString += `${i + 1}. ${userFamilys[i]}\n`;
      userFamilyCount++;
    }

    if (userFamilyCount == 0) {
      interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вы не состоите ни в одной из семей.**`)
            .setColor(`RED`)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });

      return;
    }

    if (userFamilyCount < 2) {
      let familyRoleToRemove = author.roles.cache.find(
        (r) => r.name == userFamilys[0]
      );
      currentUser.roles.remove(
        familyRoleToRemove,
        `Снятие семейной роли [Самовольный выход by ${author.user.tag}]`
      );

      interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setDescription(`**Вы вышли из семьи \`${userFamilys[0]}.\`**`)
            .setColor(`DarkGreen`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    } else {
      let leaveEmbed = new EmbedBuilder()
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL(),
        })
        .setDescription(
          `**${userFamilysString}\nВведите номер семьи которую вы хотите покинуть.\nЕсли хотите выйти из данного меню, введите \`-\`**`
        )
        .setColor(`DarkGreen`)
        .setTimestamp()
        .setFooter({
          text: `Robo Hamster`,
          iconURL: bot.user.displayAvatarURL(),
        });

      interaction.reply({
        ephemeral: true,
        embeds: [leaveEmbed],
      });

      const answer = await channel.awaitMessages({
        filter: (response) => response.member.id == author.id,
        max: 1,
        time: 1000 * 60 * 5,
        errors: ["time"],
      });

      const answerMessage = await answer.first();

      const userInputMoreZero =
        Number.parseInt(answerMessage.content.trim()) > 0;
      const userInputLessFamilysCount =
        Number.parseInt(userFamilyCount) < userFamilys.length;

      const leaveFamilyCondition =
        userInputMoreZero || userInputLessFamilysCount;
      const leavyFamilyCancelCondition = answerMessage.content.trim() == "-";

      if (leavyFamilyCancelCondition) {
        return;
      }

      if (!leaveFamilyCondition) {
        interaction.reply({
          ephemeral: true,
          embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Некорректное значение!**`)
              .setColor(`RED`)
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
        });

        return;
      }

      const selectedFamily = parseInt(answerMessage.content) - 1;
      const familyRoleToRemove = currentUser.roles.cache.find(
        (r) => r.name == userFamilys[selectedFamily]
      );

      currentUser.roles.remove(
        familyRoleToRemove,
        `Снятие семейной роли [Самовольный выход by ${author.user.tag}]`
      );

      interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setTitle(`📌 | Выход из семьи`)
            .setDescription(
              `**Вы вышли из семьи \`${userFamilys[selectedFamily]}.\`**`
            )
            .setColor(`DarkGreen`)
            .setTimestamp()
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
  },
};
