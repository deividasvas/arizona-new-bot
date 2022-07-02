const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const unban = require("../../components/unban");
const log = require("../../components/log");

module.exports = {
    name: "unban", // название команды
    descr: "Разблокировать пользователя который находится в блокировке", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Пользователь с которого будет снята блокировка",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "причина",
            description: "Причина по которой пользователю будет снята блокировка",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ], // аргументы
    perms: (rolesId) => {
        return [
            rolesId.discordMaster,
            rolesId.juniorDiscordMaster,
            rolesId.adviceAdministration
        ]
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args, channelsId}) => {
        const userForUnban =
            bot.users.cache.get(args[0]) || await bot.users.fetch(args[0]);
        const reason = args[1];

        if (!await guild.bans.fetch(userForUnban.id)) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**${userForUnban} не заблокирован**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }
        await unban(bot, guild.id, userForUnban.id, author, reason);

        await log(7, {
            guildId: guild.id, // ID сервера
            discordId: userForUnban.id, // ID упомянутого участника
            discordTag: userForUnban.tag, // Tag упомянутого участника
            discordNick: userForUnban.tag, // Серверный ник упомянутого участника
            moderatorId: author.id, // ID автора сообщения
            moderatorTag: author.user.tag, // Tag автора сообщения
            moderatorNick: author.displayName, // Серверный ник автора сообщения
            reason,
        })

        const moderationLog = guild.channels.cache.get(channelsId.rolesAndBans); // канал куда отправляем сообщение о снятии бана
        moderationLog.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Система снятия блокировки!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Снял: ${author} (${author.id})\n「📌」Кому: ${userForUnban} (${userForUnban.tag})\n 「📕」Причина: \`${reason}\`\n**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        }); // отправляем в этот канал сообщение о снятии бана

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Система снятия блокировки!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно сняли блокировку пользователю ${userForUnban} по причине \`${reason}\`**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
    },
};
