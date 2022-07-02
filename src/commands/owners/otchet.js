const {
    EmbedBuilder,
    Colors,
} = require("discord.js");
const {rolesId, channelsId} = require("../../configs/settings");
const Moderators = require('../../models/Moderators');
module.exports = {
    name: "otchet", // название команды
    descr: "Статистика на всех модераторов для отчёта", // описание команды
    perms: (rolesId) => [
        rolesId.discordMaster,
        rolesId.juniorDiscordMaster,
        rolesId.adviceAdministration,
        rolesId.curatorModeration
    ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы

    run: async ({bot, guild, channelsId, interaction, rolesId, channel}) => {
        const allModerators = (await Moderators.find({
            guildId: guild.id,
        })).filter(moderator => {
            // Фильтруем модераторов от тех которых нет на сервере(если такие есть), и от тех, кто имеет должность выше.
            const member = guild.members.cache.get(moderator.userId);
            return member?.roles.cache.some((role) => role.id === rolesId.moderator || role.id === rolesId.juniorModerator);
        });
        const moderatorsInfoString = allModerators.map(moderator => {
            const member = guild.members.cache.get(moderator.userId);
            if (!member) {
                return ``;
            }

            return `\`${member.displayName}\nКол-во снятых ролей: ${moderator.week.roles}\nКол-во тикетов: ${moderator.week.tickets}\nКол-во выданых банов: ${moderator.week.bans}\nКол-во выданых мутов: ${moderator.week.mutes}\nКол-во киков: ${moderator.week.kicks}\nКоличество баллов за неделю: ${moderator.week.balls}\` \n\n`
        });
        interaction.reply({
            ephemeral: channel.id === channelsId.curators,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Отчётность по модераторам")
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                    })
                    .setDescription(`**${moderatorsInfoString}**`)
            ]
        })
    },
};
