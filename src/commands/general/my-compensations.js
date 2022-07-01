const {ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Colors} = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");

module.exports = {
    name: "my-compensations", // название команды
    descr: "Узнать какие есть у меня компенсации", // описание команды
    isDMCommand: true, // это команда работает только в личных сообщениях
    arguments: [], // аргументы
    perms: () => [], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author}) => {
        const guilds = [];
        const {dmChannel} = author;
        for (const [id, guild] of bot.guilds.cache) {
            guilds.push({
                id,
                name: guild.name,
            })
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`⏳ | Выбор!`)
                    .setDescription(`**Выберите один из серверов где у Вас есть компенсации.\nУ Вас одна минута!**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        guilds.map(guild => {
                            return new ButtonBuilder()
                                .setLabel(guild.name)
                                .setCustomId(`guild-${guild.id}`)
                                .setStyle(ButtonStyle.Success)
                        })
                    )
            ]
        })
        const button = await dmChannel.awaitMessageComponent({
            time: 60000,
            limit: 1,
            filter: i => i.user.id === author.id && guilds.map(guild => `guild-${guild.id}`).includes(i.customId)
        }).catch(() => {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚫 | Время!`)
                        .setDescription(`Упс... Вы не успели. Повторите попытку`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        });


        // Получаем гильдию с помощью разделения по черте и выборке второго элемента, то есть, айдишника.
        const guild = bot.guilds.cache.get(button.customId.split('-')[1]);

        const {compensations: _compensations} = await getCoinsProfile(author.id, guild.id);
        const compensations = [];

        for(const compensation of _compensations){
            const variant = compensations.find(variant => compensation.label === variant.label);
            if (variant) {
                variant.count++;
                continue;
            }
            compensations.push({
                count: 1,
                label: compensation.label,
                type: compensation.type,
            });
        }

        if (compensations.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚫 | Пустота!`)
                        .setDescription(`**У Вас нет никаких компенсации на сервере \`${guild.name}\`!**`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`🌐 | Список компенсации!`)
                    .setDescription(`**\`Название | Количество | Используемый\`\n\n${compensations.map(compensation => {
                        return `\`${compensation.label} | ${compensation.count} | ${compensation.type === 'moneyAndLvl' ? "Да" : "Нет"}\``;
                    }).join('\n')}**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [],
        })
    },
};