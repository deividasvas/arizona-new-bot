const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const getAllrolesIdModers = require("../../components/getAllRolesIdModers");
const sendUserMessage = require("../../components/sendUserMessage");
const unmute = require("../../components/unmute");
const {rolesId, channelsId} = require("../../configs/settings");
const unSupportBlock = require("../../components/unSupportBlock");

module.exports = {
    name: "unsupport-block", // название команды
    descr: "Снятие блокировки возможности писать тикеты", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Пользователь с которого будет снята блокировка",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "причина",
            description: "Причина по которой пользователю нужно снять блокировку",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ], // аргументы
    perms: () => {
        return [
            rolesId.discordMaster,
            rolesId.juniorDiscordMaster,
            rolesId.adviceAdministration
        ];
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args}) => {
        const userForUnSupportBlock =
            guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
        const reason = args[1];

        if (!userForUnSupportBlock.roles.cache.some((role) => role.id === rolesId.supportBlock)) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**${userForUnSupportBlock} не имеет блокировки саппорта**`)
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
        await unSupportBlock(bot, userForUnSupportBlock.id, author, reason);

        const logChannel = guild.channels.cache.get(channelsId.administrationCouncil); // канал куда отправляем сообщение о снятии мута
        logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`📌 | Система снятия саппорт блока!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Выдавал: <@${author.id}>\n「📌」Кому: <@${userForUnSupportBlock.id}>\n 「📕」Причина: \`${reason}\`\n「📛」Саппорт блок снят!**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        }); // отправляем в этот канал сообщение о снятии саппорт блока

        sendUserMessage(
            {
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setTitle(`📌 | Система снятия саппорт блока!`)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдавал: <@${author.id}>\n「📕」Причина: \`${reason}\`\n「📛」Саппорт блок снят!**`
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            },
            userForUnSupportBlock.id,
            guild
        );
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`📌 | Система снятия саппорт блока!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно сняли саппорт блок пользователю ${userForUnSupportBlock} по причине \`${reason}\`**`
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
