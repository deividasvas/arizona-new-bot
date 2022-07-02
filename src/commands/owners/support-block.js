const {
    EmbedBuilder, ApplicationCommandOptionType, Colors,
} = require("discord.js");
const Punishment = require('../../models/Punishment');
const sendUserMessage = require("../../components/sendUserMessage");
const {scheduleJob} = require("node-schedule");
const log = require("../../components/log");
module.exports = {
    name: "support-block", // название команды
    descr: "Блокировка саппорта пользователю", // описание команды
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [{
        name: "пользователь",
        description: "Пользователь которому будет выдана блокировка саппорта",
        type: ApplicationCommandOptionType.User,
        required: true,
    }, {
        name: "дней",
        description: "Количество дней на которое выдаётся человеку будет выдана блокировка саппорта",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }, {
        name: "причина",
        description: "Причина по которой будет выдана блокировка саппорта",
        type: ApplicationCommandOptionType.String,
        required: true,
    }], // аргументы

    run: async ({bot, guild, args, interaction, author, rolesId, channelsId}) => {
        const userForSupportBlock = guild.members.cache.get(args[0]);
        const days = args[1];
        const reason = args[2];

        // проверяем есть ли у человека саппорт блок, если да, то выкидываем ошибку что уже есть саппорт блок.
        const supportBlock = await Punishment.findOne({
            userId: userForSupportBlock.id,
            guildId: guild.id
        });
        if (supportBlock) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**У пользователя ${userForSupportBlock} уже есть блокировка саппорта. Если это не так, то обратитесь к <@&${rolesId.techSection}>**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ]
            })
        }

        userForSupportBlock.roles.add(rolesId.supportBlock);
        const dateEnd = new Date();
        dateEnd.setDate(dateEnd.getDate() + Number(days));
        await new Punishment({
            action: "support-block",
            moderatorId: author.id,
            userId: userForSupportBlock.id,
            guildId: guild.id,
            reason,
            dateEnd,
        }).save();

        log(18, {
            guildId: guild.id, // ID сервера
            discordId: userForSupportBlock.id, // ID упомянутого участника
            discordTag: userForSupportBlock.user.tag, // Tag упомянутого участника
            discordNick: userForSupportBlock.displayName, // Серверный ник упомянутого участника
            moderatorId: author.id, // ID автора сообщения
            moderatorTag: author.user.tag, // Tag автора сообщения
            moderatorNick: author.displayName, // Серверный ник автора сообщения
        })

        // канал куда будет логироваться выдача саппорт блока
        const logChannel = guild.channels.cache.get(channelsId.administrationCouncil);
        logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkRed)
                    .setTitle('📌 | Система выдачи Support Block!')
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Выдал: <@${author.id}> (${author.user.tag})\n「📌」Кому: <@${userForSupportBlock.id}> (${userForSupportBlock.user.tag})\n「📕」Причина: \`${reason}\`\n「📅」До снятия блокировки саппорта \`${days}\` дней**`
                    )
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
        // снимаем саппорт блок как приходит время
        await sendUserMessage(
            {
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle('📌 | Система выдачи Support Block!')
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдал: <@${author.id}> (${author.user.tag})\n「📕」Причина: \`${reason}\`\n「📅」До снятия блокировки саппорта \`${days}\` дней**`
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            },
            userForSupportBlock.id,
            guild
        );

        scheduleJob(`support-block-${userForSupportBlock.id}`, dateEnd, () => {
            logChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(`📌 | Система снятия блокировки саппорта!`)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдавал: <@${author.id}>\n「📕」Причина: \`${reason}\`\n「**`
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            })
        });

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Система снятия блокировки саппорта!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно выдали саппорт блок пользователю ${userForSupportBlock} на \`${days}\` дней по причине \`${reason}\`**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        })
    },
}
;
