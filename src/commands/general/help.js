const {EmbedBuilder, Colors, ButtonStyle, ActionRowBuilder, ButtonBuilder} = require("discord.js");

module.exports = {
    name: "help", // название команды
    descr: "Помощь по командам", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [], // аргументы
    perms: (rolesId) => [rolesId.everyone], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, rolesId}) => {
        // Сделать фильтрацию команд
        // Ограничить попадание структур owner и moders в general

        const isAdmin = author.permissions.has("Administrator");

        let availableCommands = [...bot.commands.values()].filter(command => {
            if (command.archive) {
                return false;
            }
            if (isAdmin) {
                return true;
            }
            const permissions = command.perms(rolesId);
            if (!author.roles.cache.some(role => permissions.includes(role.id))) {
                return false;
            }
            return true;
        });

        let getElementsByList = (list) => {
            const startIndex = (list * listElementsCount) - listElementsCount;
            const endIndex = startIndex + listElementsCount;

            return availableCommands.slice(startIndex, endIndex);
        }

        let listElementsCount = 10;
        let list = 1;
        let availableLists = Math.ceil(availableCommands.length / listElementsCount);
        let isReplied = false;


        const renderCommandsByList = async (list) => {
            // await interaction.deferReply();
            const commands = getElementsByList(list);
            let message = {
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`📌 | Список команд!`)
                        .setDescription(
                            `**${commands.map(command => {
                                // console.log()
                                return `/${command.name} ${command.arguments.map(arg => `[${arg.name}]`)} - ${command.descr}`
                            }).join('\n')}**`
                            // `**/${allowCommands.name} - ${allowCommands.descr}**`
                        )
                        .setColor(Colors.Blue)
                        .setTimestamp()
                        .setFooter({
                            text: `Страница ${list}/${availableLists}`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            [
                                new ButtonBuilder()
                                    .setLabel('←')
                                    .setDisabled(list === 1)
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId(`helpBackList`),
                                new ButtonBuilder()
                                    .setLabel('→')
                                    .setDisabled(list === availableLists)
                                    .setStyle(ButtonStyle.Primary)
                                    .setCustomId(`helpNextList`),
                            ]
                        )
                ]
            };

            try {
                if (isReplied) {
                    return interaction.editReply(message);
                }
                interaction.reply(message);
                isReplied = true;
            } catch (e) {
                interaction.reply(message);
                isReplied = true;
            }

        }

        const render = async () => {
            await renderCommandsByList(list);
            const reply = await interaction.fetchReply();
            const button = await interaction.channel.awaitMessageComponent({
                filter: testInteraction => reply.id === testInteraction.message.id && testInteraction.member.id === author.id && ['helpBackList', 'helpNextList'].includes(testInteraction.customId),
                limit: 1,
                time: 60000,
                errors: ['time']
            }).catch(() => {
                try {
                    interaction.deleteReply();
                } catch(e){
                    return;
                }
            })

            if(!button){
                return;
            }

            if(button.customId === 'helpBackList'){
                list--;
                render();
            }
            if(button.customId === 'helpNextList'){
                list++;
                render();
            }
            button.reply({
                ephemeral: true,
                content: `Произошёл переход на ${list} лист`
            })
        }


        render();
    },
};
