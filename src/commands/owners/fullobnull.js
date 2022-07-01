const {
    EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle,
} = require("discord.js");
const Moderators = require("../../models/Moderators");
module.exports = {
    name: "fullobnull", // название команды
    descr: "Обнулить полностью статистику модерации", // описание команды
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration, rolesId.curatorModeration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы

    run: async ({bot, guild, author, interaction}) => {
        const answer = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Обнуление недельных баллов!")
                    .setColor(Colors.Blue)
                    .setDescription("**Вы уверены что хотите ОБНУЛИТЬ недельные баллы модераторам?**")
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
                            .setCustomId('fullObnullYes')
                            .setLabel(`Да`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('fullObnullNo')
                            .setLabel(`Нет`)
                            .setStyle(ButtonStyle.Danger)
                    ]
                )
            ]
        });

        const allModerators = await Moderators.find();
        const oldBest = await Moderators.findOne({ theBestModerator: true })
        const sortedModerators = allModerators.sort(async(a, b) => b.week.balls - a.week.balls);

        const bestModerator = guild.members.cache.get(sortedModerators[0].userId);
        const oldBestModerator = guild.members.cache.get(oldBest.userId);

        await oldBestModerator.roles.remove(rolesId.theBestWeekModerator);
        await bestModerator.roles.add(rolesId.theBestWeekModerator);

        const filter = i => i.user.id == author.id && (i.customId === 'fullObnullYes' || i.customId == 'fullObnullNo')
        const collector = answer.createMessageComponentCollector({
            time: 30000,
            max: 1,
            filter,
        });

        collector.on('collect', async (collectInteraction) => {
            if (collectInteraction.customId === 'fullObnullNo') {
                return interaction.deleteReply();
            }

            await Moderators.updateMany({
                userId: oldBestModerator.id
            }, {
                theBestModerator: false
            })

            await Moderators.updateMany({
                userId: bestModerator.id
            }, {
                theBestModerator: true
            });

            await Moderators.updateMany({
                guildId: guild.id
            }, {
                week: {
                    roles: 0, // количество снятых ролей
                    tickets: 0, // количество отвеченных тикетов
                    kicks: 0, // количество киков
                    bans: 0, // количество баннов
                    mutes: 0, // количество мутов
                    goodAnswers: 0, // хорошие ответы в тикетах
                    toxicAnswers: 0, // токсичные ответы в тикетах
                    balls: 0, // недельные баллы
                    giveRoles: 0, // количество выданных ролей
                }
            });

            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📌 | Обнуление недельных баллов!")
                        .setColor(Colors.Blue)
                        .setDescription(`**Баллы были успешно обнулены!**`)
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
        });
    },
};
