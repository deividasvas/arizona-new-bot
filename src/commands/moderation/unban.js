const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllrolesIdModers = require("../../components/getAllRolesIdModers");
const sendUserMessage = require("../../components/sendUserMessage");
const unmute = require("../../components/unmute");
const {rolesId, channelsId} = require("../../configs/settings");
const unban = require("../../components/unban");

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
    perms: () => {
        return [
            rolesId.discordMaster,
            rolesId.juniorDiscordMaster,
            rolesId.adviceAdministration
        ]
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args}) => {
        const userForUnban =
            bot.users.cache.get(args[0]) || await bot.users.fetch(args[0]);
        const reason = args[1];

        if (!await guild.bans.fetch(userForUnban.id)) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**${userForUnmute} не заблокирован**`)
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
        await unban(bot, guild.id, userForUnban.id, author, reason);

        const moderationLog = guild.channels.cache.get(channelsId.rolesAndBans); // канал куда отправляем сообщение о снятии бана
        moderationLog.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`📌 | Система снятия блокировки!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Снял: ${author} (${author.id})\n「📌」Кому: <@${userForUnban.id}> (${userForUnban.tag})\n 「📕」Причина: \`${reason}\`\n**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        }); // отправляем в этот канал сообщение о снятии бана

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
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
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
    },
};
