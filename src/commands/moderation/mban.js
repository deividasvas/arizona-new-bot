const {ActionRowBuilder} = require("discord.js");
const {
    EmbedBuilder,
    ApplicationCommandOptionType,
    Colors,
    ButtonStyle,
} = require("discord.js");
const {
    ButtonBuilder,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const BansVotes = require("../../models/BansVotes");
const timeChecker = require("../../components/timeChecker");
const bans = new timeChecker("бан");

module.exports = {
    name: "mban", // название команды
    descr: "Заблокировать пользователя на сервере", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Пользователь которого Вы заблокировать на сервере",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
        {
            name: "срок",
            description: "Срок в днях насколько Вы хотите заблокировать пользователя",
            type: ApplicationCommandOptionType.Number,
            required: true,
        },
        {
            name: "причина",
            description: "Причина по которой Вы хотите заблокировать пользователя",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ], // аргументы
    perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({
                    bot, interaction, author, guild, args, rolesId, channelsId, whiteListRoles,
                }) => {
        const userForBanId = args[0]
        const userForBan = guild.members.cache.get(userForBanId);
        const days = args[1];
        const reason = args[2];

        const roleInWhiteList = userForBan?.roles.cache.find((role) =>
            whiteListRoles.includes(role.id)
        ); // проверяем, есть ли у человека роль которая находится в белом списке по отношению к выдачам наказаний.
        if (roleInWhiteList) {
            // если у человека есть роль из белого списка ролей, то отвечаем запросившему что у пользователя роль из белого списка
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Пользователя <@${userForBanId}> невозможно наказать потому, что, у него есть роль <@&${roleInWhiteList.id}> которая находится в белом списке.**`
                        )
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

        const moderationChannel = guild.channels.cache.get(channelsId.moderation);
        const banVote = new BansVotes({
            moderatorSenderId: author.id, // айди модератора
            userForBanId: userForBanId, // айди юзера которого банят
            days, // количество дней бана
            reason, // причина бана
            agrees: [], // айдишники принявших бан
            denies: [], // айдишники отказавших бан
        });
        banVote.save();
        await moderationChannel.send({
                content: `<@&${rolesId.juniorModerator}>`,
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: `${interaction.guild.name} » Временая блокировка участника.`,
                            iconURL: interaction.guild.iconURL(),
                        })
                        .addFields([{
                            name: `Информация:`,
                            value: `>>> \`Отправитель:\` ${author}\n\`Нарушитель:\` <@${userForBanId}>\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: 0\n\`\`Против\`\`: 0`,
                            inline: false,
                        }])
                        .setColor(Colors.Blue)
                        .setTimestamp()
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],

                components: [
                    new ActionRowBuilder().addComponents([
                        new ButtonBuilder()
                            .setEmoji({
                                name: `✅`,
                            })
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`banYes`),

                        new ButtonBuilder()
                            .setEmoji({
                                name: `❌`,
                            })
                            .setStyle(ButtonStyle.Secondary)
                            .setCustomId(`banNo`)
                    ])
                ],
            }
        )
        ;

        await interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setAuthor({
                        name: `${interaction.guild.name} » Временая блокировка участника.`,
                        iconURL: interaction.guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно отправили заявление на блокировку пользователя <@${userForBanId}> на \`${days}\` дней по причине \`${reason}\`**`
                    )
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });

        bans.addModeratorPunish(author.id, guild.id);
    },
}
;
