const { EmbedBuilder, Colors } = require("discord.js");
const { maxCountRebukes, getGuildChannelsId} = require("../configs/settings");
const setWarnsOrRebukes = require("./setWarnsOrRebukes");

// Функция понижения в должности модераторов, кураторов, совета
const downgradeModerator = async (
  bot,
  guildId,
  moderatorId,
  provocateurId,
  fromPostRoleId,
  toWhomRoleId,
  reasonLastRebuke
) => {
  const guild = bot.guilds.cache.get(guildId);
  const moderator = guild.members.cache.get(moderatorId);
  await setWarnsOrRebukes(moderator.id, () => []); // обнуляем все преды и выговоры в связи с понижением
  await moderator.roles.remove(fromPostRoleId);
  const channelsId = getGuildChannelsId(guild.id);
  const punishModeratorsLogChannel = guild.channels.cache.get(
    channelsId.punishModeratorsLog
  );
  punishModeratorsLogChannel.send({
    content: `<@${provocateurId}> <@${moderatorId}>`,
    embeds: [
      new EmbedBuilder()
        .setColor(Colors.Blue)
        .setTitle(`📌 | Система понижения!`)
        .setAuthor({
          name: guild.name,
          iconURL: guild.iconURL(),
        })
        .setDescription(
          `**「📝」Понизил: <@${provocateurId}>\n「🥶」Кого: ${moderator}\n「📕」Причина: \`${maxCountRebukes}/${maxCountRebukes} выговоров\`\n「⛔」Причина последнего выговора: \`${reasonLastRebuke}\`\n「😿」${moderator} был понижен до должности <@&${toWhomRoleId}>**`
        )
        .setTimestamp()
        .setFooter({
          text: `Surprise Bot`,
          iconURL: bot.user.displayAvatarURL(),
        }),
    ],
  });

  moderator.roles.add(toWhomRoleId);
};

module.exports = downgradeModerator;
