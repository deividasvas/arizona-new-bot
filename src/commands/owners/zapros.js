const {
    EmbedBuilder,
    ButtonStyle,
    Colors, ActionRowBuilder, ButtonBuilder,
} = require("discord.js");
module.exports = {
    name: "zapros", // название команды
    descr: "Обновить эмбед в канале запрос-ролей", // описание команды
    perms: (rolesId) => [rolesId.discordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы

    async run({bot, guild, channelsId, rolesId}) {
        // канал запрос-ролей где мы будем всё менять
        const rolesRequestsChannel = guild.channels.cache.get(channelsId.requestRoles);
        // получаем все сообщения в массиве от бота которые будем редактировать
        const messagesOfBot = [];

        for (const [id, message] of Array.from((await rolesRequestsChannel.messages.fetch()).filter(message => message.author.id === bot.user.id)).reverse()) {
            messagesOfBot.push(message);
        }

        const embed = new EmbedBuilder()
            .setColor(Colors.DarkGreen)
            .setTitle(`📌 | Информация о получении ролей`)
            .setTimestamp()
            .setDescription(`**Теги организаций можно посмотреть в канале <#${channelsId.rolesForms}>**\n\n**Чтобы запросить роль, нажмите на кнопку \`запрос роли фракции\` и ожидайте одобрения от <@&${rolesId.juniorModerator}> и <@&${rolesId.moderator}>**\n**У гетто и мафий свой дискорд сервер!**\n[нелегалы](https://discord.gg/Je97Bh4)`)
            .setAuthor({
                name: guild.name, iconURL: guild.iconURL(),
            })
            .setFooter({
                text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
            })
        const row = new ActionRowBuilder().addComponents(
            [
                new ButtonBuilder()
                    .setCustomId('add_roles_request')
                    .setStyle(ButtonStyle.Success)
                    .setLabel(`Запросить роль фракции`),
                new ButtonBuilder()
                    .setCustomId('remove_roles_request')
                    .setStyle(ButtonStyle.Primary)
                    .setLabel(`Снять роль фракции`),
                new ButtonBuilder()
                    .setCustomId('add_remove_role_x')
                    .setLabel(`Получить/снять роль X`)
                    .setStyle(ButtonStyle.Secondary),
            ]
        );

        if (!messagesOfBot[0]) {
            await rolesRequestsChannel.send({
                embeds: [
                    embed,
                ],
                components: [
                    row
                ]
            });
        } else {
            await messagesOfBot[0].edit({
                embeds: [
                    embed,
                ],
                components: [
                    row
                ]
            })
        }
    },
}
