const {
    EmbedBuilder, ApplicationCommandOptionType, Colors,
} = require("discord.js");
const getModerInfo = require("../../components/getModerInfo");
const setModerInfoParam = require("../../components/setModerInfoParam");
module.exports = {
    name: "unneactive", // название команды
    descr: "Снять неактив модератору", // описание команды
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration, rolesId.curatorModeration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
        name: "модератор",
        description: "Модератор которому Вы хотите снять неактив",
        type: ApplicationCommandOptionType.User,
        required: true,
    }, {
        name: "reason",
        description: "Причина по которой Вы хотите снять неактив",
        type: ApplicationCommandOptionType.String,
        required: true,
    },], // аргументы

    run: async ({bot, guild, args, interaction, channelsId, rolesId, channel}) => {
        const moderator = guild.members.cache.get(args[0]);
        const reason = args[1];
        const {neactive} = await getModerInfo(bot, guild.id, moderator.id);
        if (!neactive.active) {
            // если есть действующий не актив, то отдаём ошибку
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**У модератора нет неактива**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }

        await setModerInfoParam(moderator.id, guild.id, `neactive`, `dateEnd`, new Date());
        await setModerInfoParam(moderator.id, guild.id, `neactive`, `givedId`, "none");
        await setModerInfoParam(moderator.id, guild.id, `neactive`, `active`, false);
        await setModerInfoParam(moderator.id, guild.id, `neactive`, `reason`, "");

        moderator.roles.add(rolesId.neactive)

        const neactiveLogChannel = guild.channels.cache.get(channelsId.neactiveLog)
        neactiveLogChannel.send({
            embeds: [new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(`📌 | Снятие неактива`)
                .setTimestamp()
                .setDescription(`**「📝」Выдавал: <@${neactive.givedId}>\n「😭」Кому: ${moderator}\n「📕」 Причина неактива: ${neactive.reason}\n「😱」 Причина снятия неактива: ${reason}\n「📅」Неактив снят**`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                })]
        })
        interaction.reply({
            ephemeral: channel.id !== channelsId.curators, embeds: [new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(`📌 | Снятие неактива`)
                .setTimestamp()
                .setDescription(`**Вы успешно сняли неактив модератору ${moderator} по причине ${reason}**`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                })]
        })
    },
};