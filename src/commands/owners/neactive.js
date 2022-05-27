const {
    EmbedBuilder, ApplicationCommandOptionType, Colors,
} = require("discord.js");
const getModerInfo = require("../../components/getModerInfo");
const setModerInfoParam = require("../../components/setModerInfoParam");
const {scheduleJob} = require("node-schedule");
const Moderators = require("../../models/Moderators");
module.exports = {
    name: "neactive", // название команды
    descr: "Выдать неактив модератору", // описание команды
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration, rolesId.curatorModeration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [{
        name: "модератор",
        description: "Модератор которому Вы хотите выдать неактив",
        type: ApplicationCommandOptionType.User,
        required: true,
    }, {
        name: "дни",
        description: "Количество дней на которое будет выдан неактив",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }, {
        name: "причина",
        description: "Причина по которой Вы выдаёте неактив модератору",
        type: ApplicationCommandOptionType.String,
        required: true,
    }], // аргументы

    run: async ({bot, guild, args, interaction, author, channel, rolesId, channelsId}) => {
        const moderator = guild.members.cache.get(args[0]);
        const days = args[1];
        const reason = args[2];
        const {neactive, guildId, userId} = await getModerInfo(bot, guild.id, moderator.id);
        if (neactive.status) {
            // если есть действующий не актив, то отдаём ошибку
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**У модератора уже имеется активный неактив**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }

        const dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDate() + days);

        await setModerInfoParam(moderator.id, guild.id, `neactive`, `dateEnd`, dateEnd);
        await setModerInfoParam(moderator.id, guild.id, `neactive`, `givedId`, author.id);
        await setModerInfoParam(moderator.id, guild.id, `neactive`, `active`, true);
        await setModerInfoParam(moderator.id, guild.id, `neactive`, `reason`, reason);

        moderator.roles.add(rolesId.neactive)

        const neactiveLogChannel = guild.channels.cache.get(channelsId.neactiveLog)
        neactiveLogChannel.send({
            embeds: [new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(`📌 | Выдача неактива`)
                .setTimestamp()
                .setDescription(`**「📝」Выдал: <@${author.id}>\n「🥴」Кому: ${moderator}\n「📕」Причина: \`${reason}\`\n「📅」Неактив будет снят \`${dateEnd.getDate().toString().padStart(2, '0')}.${(dateEnd.getMonth() + 1).toString().padStart(2, '0')}.${dateEnd.getFullYear()}\`**`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                })]
        })
        interaction.reply({
            ephemeral: channel.id !== channelsId.curators, embeds: [new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(`📌 | Выдача неактива`)
                .setTimestamp()
                .setDescription(`**Вы успешно выдали неактив модератору ${moderator} на ${days} дней по причине ${reason}**`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                })]
        })
        scheduleJob(`${guildId}-${userId}-neactive`, dateEnd, async () => {
            const embed = new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle(`📌 | Конец неактива!`)
                .setTimestamp()
                .setDescription(`**「📝」Выдавал: <@${moderator.id}>\n「😭」Кому: <@${userId}>\n「📕」Причина: \`${reason}\`\n「📅」Неактив снят**`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                })
            const neactiveLogChannel = guild.channels.cache.get(channelsId.neactiveLog);
            neactiveLogChannel.send({
                embeds: [embed]
            });
            moderator.roles.remove(rolesId.neactive);
            await Moderators.updateOne({
                userId: moderator.userId,
                guildId: moderator.guildId
            }, {
                $set: {
                    neactive: {
                        ...neactive,
                        active: false,
                    }
                }
            });
        })
    },
};