const {
    EmbedBuilder, ButtonStyle, Colors, ActionRowBuilder, ButtonBuilder,
} = require("discord.js");
module.exports = {
    name: "first-step-embed", // название команды
    descr: "Обновить эмбед в канале первые-шаги", // описание команды
    perms: (rolesId) => [rolesId.discordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы

    async run({bot, guild, channelsId, interaction}) {
        // канал где будет меняться эмбед
        const firstSteps = guild.channels.cache.get(channelsId.firstSteps);
        // получаем все сообщения в массиве от бота которые будем редактировать
        const messagesOfBot = [];

        for (const [id, message] of Array.from((await firstSteps.messages.fetch()).filter(message => message.author.id === bot.user.id)).reverse()) {
            messagesOfBot.push(message);
        }

        const embed = new EmbedBuilder()
            .setTitle(`📌 | Первые шаги!`)
            .setColor(Colors.Blue)
            .setDescription(`**Добро пожаловать на дискорд игрового сервера:
\`${guild.name}\`

Приветствую тебя, друг, давай познакомим тебя с нашим дискордом!

На данный момент ты находишься в канале <#${channelsId.firstSteps}>, здесь у тебя ограниченные возможности, но ты не огорчайся, по истечению 10 минут ты сможешь получить доступ и к другим каналам!

Для начала тебе нужно ознакомится с правилами нашего дискорда, ведь если ты будешь нарушать, то тебя могут забанить. Прочитать правила ты сможешь здесь <#${channelsId.rules}>

После этого не забудь ознакомится с интересной информацией <#${channelsId.discordInfo}>

Уже прочитал? Ну хорошо
Для получение роли тебе нужно будет сделать ник по форме для твоей организации:
\`[Организация][Ранг] Имя Фамилия\`
Тэги организаций ты можешь посмотреть в канале <#${channelsId.rolesForms}>

После того как ты все сделал, тебе нужно будет зайти в канал <#${channelsId.requestRoles}> и нажать на кнопку "Запросить роль фракции"

Остались еще вопросы? Обращайся сюда <#${channelsId.support}>, тебе там помогут! Удачи :)
**`)
            .setTimestamp()
            .setAuthor({
                name: guild.name, iconURL: guild.iconURL(),
            })
            .setFooter({
                text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
            })

        if (messagesOfBot[0]) {
            messagesOfBot[0].edit({
                embeds: [embed],
            });
        } else {
            firstSteps.send({
                embeds: [embed],
            })
        }

        interaction.reply({
            ephemeral: true,
            embeds: [new EmbedBuilder()
                .setTitle(`📌 | Обновление сообщения!`)
                .setColor(Colors.Blue)
                .setDescription(`**Эмбед в канале <#${channelsId.firstSteps}> успешно обновлен**`)
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
