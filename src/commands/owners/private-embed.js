const {
    EmbedBuilder,
    ButtonStyle,
    Colors, ActionRowBuilder, ButtonBuilder,
} = require("discord.js");
module.exports = {
    name: "private-embed", // название команды
    descr: "Обновить эмбед в канале управление", // описание команды
    perms: (rolesId) => [rolesId.discordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы

    async run({bot, guild, channelsId, interaction}) {
        // канал где будет меняться эмбед
        const privateManageChannel = guild.channels.cache.get(channelsId.managePrivate);
        // получаем все сообщения в массиве от бота которые будем редактировать
        const messagesOfBot = [];

        for (const [id, message] of Array.from((await privateManageChannel.messages.fetch()).filter(message => message.author.id === bot.user.id)).reverse()) {
            messagesOfBot.push(message);
        }

        const embed = new EmbedBuilder()
            .setTitle(`📌 | Измените настройки для вашего временного голосового канала!`)
            .setColor(Colors.DarkGreen)
            .setTimestamp()
            .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
            })
            .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
            })


        const row = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel(`Название`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("changePrivateName")
                .setEmoji({
                    name: `🔧`
                }),
            new ButtonBuilder()
                .setLabel(`Открыть/закрывать вход`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("openClosePrivate")
                .setEmoji({
                    name: `🔒`
                }),
            new ButtonBuilder()
                .setLabel(`Скрыть/открыть для всех`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("hideShowPrivate")
                .setEmoji({
                    name: `👁️`
                }),
            new ButtonBuilder()
                .setLabel(`Установка лимита`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("setLimitPrivate")
                .setEmoji({
                    name: `🛠️`
                }),
        ])

        const row2 = new ActionRowBuilder().addComponents([
            new ButtonBuilder()
                .setLabel(`Добавить пользователя`)
                .setStyle(ButtonStyle.Success)
                .setCustomId("addUserPrivate")
                .setEmoji({
                    name: `➕`
                }),
            new ButtonBuilder()
                .setLabel(`Кикнуть пользователя`)
                .setStyle(ButtonStyle.Danger)
                .setCustomId("removeUserPrivate")
                .setEmoji({
                    name: `➖`
                }),
            new ButtonBuilder()
                .setLabel(`Удалить приват`)
                .setStyle(ButtonStyle.Danger)
                .setCustomId("deletePrivate")
                .setEmoji({
                    name: `🗑️`
                }),
        ])

        if (messagesOfBot[0]) {
            messagesOfBot[0].edit({
                embeds: [embed],
                components: [row, row2]
            });
        } else {
            privateManageChannel.send({
                embeds: [embed],
                components: [row, row2]
            })
        }

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Обновление сообщения!`)
                    .setColor(Colors.DarkGreen)
                    .setDescription(`**Эмбед в канале <#${channelsId.managePrivate}> успешно обновлен**`)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
    },
};
