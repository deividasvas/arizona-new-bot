const { Colors } = require("discord.js");
const { EmbedBuilder } = require("discord.js/node_modules/@discordjs/builders");
const { channelsId, rolesId } = require("../configs/settings");
const Moderators = require("../models/Moderators");
const getModerInfo = require("./getModerInfo");

/*
    Функция снятия модератора
*/
const removeModerator = async (bot, guildId, moderatorId) => {
  const guild = bot.guilds.cache.get(guildId);
  const curatorsChannel = guild.channels.cache.get(channelsId[guildId].curators);
  const moderator =
    guild.members.cache.get(moderatorId) ||
    (await guild.members.fetch(moderatorId));

  const moderatorInfo = await getModerInfo(bot, guildId, moderatorId);
  const {
    roles,
    tickets,
    kicks,
    bans,
    mutes,
    immunities,
    coefficient,
    goodAnswers,
    toxicAnswers,
    balls,
  } = moderatorInfo.main;
  const { warns: warnsOrRebukes } = moderatorInfo;
  const rebukes = warnsOrRebukes.filter(
    (warnOrRebuke) => warnOrRebuke.group === "rebuke"
  );
  const warns = warnsOrRebukes.filter(
    (warnOrRebuke) => warnOrRebuke.group === "warn"
  );
  await curatorsChannel.send({
    content: `<@&${rolesId[guildId].curatorModeration}>`,
    embeds: [
      new EmbedBuilder()
        .setTitle(`\`Снятие модератора:\`**${moderator.displayName}**`)
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL(),
        })
        .setDescription(
          `**Сняли: <@${moderatorId}>[\`${moderatorId}\`]\n\`\`\`\n[ Статистика модератора до снятия ]\`\`\`\n>>> Снятые роли: \`${roles}\`\nОтвеченые тикеты: \`${tickets}\`\nЗабанено пользователей: \`${bans}\`\nКикнуто пользователей: \`${kicks}\`\nЗамучено пользователей: \`${mutes}\`\nКоличество хороших оценок: \`${goodAnswers}\`\nКоличество плохих оценок: \`${toxicAnswers}\`\nКоличество баллов: \`${balls}\`\nМножитель баллов: \`${coefficient}\`\nВыговоров: \`${rebukes.length}\`\nПредупреждений: \`${warns.length}\`\nИммунитетов: \`${immunities}\`**`
        )
        .setColor(Colors.Blue)
        .setFooter({
          text: `Robo Hamster`,
          iconURL: bot.user.displayAvatarURL(),
        }),
    ],
  });

  await moderator.roles.remove(rolesId.juniorModerator);
  await Moderators.deleteOne({
    discordId: moderatorId,
  });
};

module.exports = removeModerator;
