const {
    EmbedBuilder,
    Colors,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {
    name: "clear-tickets", // название команды
    descr: "Очистить корзину с тикетами", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [], // аргументы
    perms: (rolesId) => [
        rolesId.discordMaster, // discord master
        rolesId.juniorDiscordMaster, // jr.discord master
        rolesId.adviceAdministration, // совет администрации дискорда
        rolesId.curatorModeration, // куратор модерации
    ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, rolesId, categories}) => {
        const categoryWithTickets = guild.channels.cache.get(categories.basketTickets);
        const answer = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Очистка корзины!")
                    .setColor(Colors.DarkGreen)
                    .setDescription("**Вы уверены что хотите очистить корзину?**")
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    [
                        new ButtonBuilder()
                            .setCustomId('ticketclearYes')
                            .setLabel(`Да`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('ticketclearNo')
                            .setLabel(`Нет`)
                            .setStyle(ButtonStyle.Danger)
                    ]
                )
            ]
        });
        const filter = i => i.user.id == author.id && (i.customId === 'ticketclearYes' || i.customId == 'ticketclearNo')
        const collector = answer.createMessageComponentCollector({
            time: 30000,
            max: 1,
            filter,
        });
        collector.on('collect', async (collectInteraction) => {
            if (collectInteraction.customId === 'ticketclearYes') {
                for (const [id, ticket] of guild.channels.cache) {
                    if (!ticket.name.startsWith('ticket-')) continue; // Если канал не тикет, то выходим
                    if (ticket.parentId === categoryWithTickets.id) { // Если тикет находиться в корзине, то удаляем
                        await ticket.delete();
                    }
                }
                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("📌 | Очистка корзины!")
                            .setColor(Colors.DarkGreen)
                            .setDescription(`**Корзина успешно очищена!\nЗапросил: ${author}**`)
                            .setTimestamp()
                            .setAuthor({
                                name: guild.name,
                                iconURL: guild.iconURL(),
                            })
                            .setFooter({
                                text: `Robo Hamster`,
                                iconURL: bot.user.displayAvatarURL(),
                            })
                    ],
                    components: []
                });
            } else {
                interaction.deleteReply();
            }
        })
    },
};
