const {
    EmbedBuilder, ButtonStyle, Colors, ActionRowBuilder, ButtonBuilder,
} = require("discord.js");
module.exports = {
    name: "updates-embed", // название команды
    descr: "Обновить эмбед в канале предложения по улучшению", // описание команды
    perms: (rolesId) => [rolesId.discordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы

    async run({bot, guild, channelsId, interaction}) {
        // канал где будет меняться эмбед
        const requestsForUpdates = guild.channels.cache.get(channelsId.requestForUpdates);
        // получаем все сообщения в массиве от бота которые будем редактировать
        const messagesOfBot = [];

        for (const [id, message] of Array.from((await requestsForUpdates.messages.fetch()).filter(message => message.author.id === bot.user.id)).reverse()) {
            messagesOfBot.push(message);
        }

        const embed = new EmbedBuilder()
            .setTitle(`📌 | Предложения по улучшению!`)
            .setColor(Colors.DarkPurple)
            .setDescription(`
Доброго времени суток, уважаемые игроки, данный канал создан для ваших предложений/улучшений Discord. Для того что бы отправить его, достаточно просто написать слово и сообщение автоматически передаётся Discord Master'ам. Если ваше сообщение будет неадекватным, администрация вправе наказать Вас. Поэтому будьте адекватными. Если же ваше улучшение нам подойдёт, мы обязательно вам сообщим

Если вы хотите прикрепить картинку к своему предложения используйте сервисы по типу Imgur и т.д

**Оффтоп/Бред в предложения мут на 60 минут**
`)
            .setTimestamp()
            .setAuthor({
                name: guild.name, iconURL: guild.iconURL(),
            })
            .setFooter({
                text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
            })
            .setImage("https://images-ext-2.discordapp.net/external/_xP3aYiyMM6cHa6-yAo_QAUm8IMwyJ6Y9m6rP19WH0g/https/images-ext-2.discordapp.net/external/0AmbBsPa4GWh0kIPtCWje6z8IFI38cc43W8YbGHldhU/https/images-ext-2.discordapp.net/external/z96taxZ7kvTVwGuR4lXY4MwRJO9KnvZzzDd7kTq59sY/https/support.discordapp.com/hc/en-us/article_attachments/206303208/eJwVyksOwiAQANC7sJfp8Ke7Lt15A0MoUpJWGmZcGe-ubl_eW7zGLmaxMZ80A6yNch-rJO4j1SJr73Uv6Wwkcz8gMae8HeXJBOjC5NEap42dokUX_4SotI8GVfBaYYDldr3n3y_jomRtD_H5ArCeI9g.zGz1JSL-9DXgpkX_SkmMDM8NWGg.gif");

        const row = new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()
                    .setLabel("Создание баг репорта")
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId(`createBugReport`)
                    .setEmoji({
                        name: `🔨`
                    })
            ])
        if (messagesOfBot[0]) {
            messagesOfBot[0].edit({
                embeds: [embed],
                components: [
                    row
                ]
            });
        } else {
            requestsForUpdates.send({
                embeds: [embed],
                components: [
                    row
                ]
            })
        }

        interaction.reply({
            ephemeral: true,
            embeds: [new EmbedBuilder()
                .setTitle(`📌 | Обновление сообщения!`)
                .setColor(Colors.Blue)
                .setDescription(`**Эмбед в канале <#${channelsId.requestForUpdates}> успешно обновлен**`)
                .setTimestamp()
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                })]
        });
    },
};
