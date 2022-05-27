const {
    EmbedBuilder, Colors, ApplicationCommandOptionType, ChannelType
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");

module.exports = {
    name: "mp-create", // название команды
    descr: "Создать МП для модерации", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    archive: true, // находится ли команда в архиве
    arguments: [], // аргументы
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args, channelsId, rolesId}) => {
        // КОМАНДА ПЕРЕНЕСЕНА ЛИШЬ В ТЕОРИИ. НЕОБХОДИМО ТЕСТИРОВАНИЕ!!!!!
        const channel = await guild.channels.create(`mp-модераторы`, {
            type: ChannelType.GuildText, permissionOverwrites: [{
                id: guild.id,
                allow: ['EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'SendMessages'],
                deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTtsMessages', 'ManageChannels', 'MentionEveryone', 'ViewChannel']
            }, {
                id: guild.id,
                allow: ['EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'SendMessages'],
                deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTtsMessages', 'ManageChannels', 'MentionEveryone', 'ViewChannel']
            }, {
                id: rolesId.juniorDiscordMaster,
                allow: ['ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'SendMessages', 'ManageChannels', 'CreateInstantInvite', 'ManageRoles', 'ManageWebhooks', 'SendTtsMessages', 'ManageMessages', 'MentionEveryone'],
            }, {
                id: rolesId.adviceAdministration,
                allow: ['EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'SendMessages'],
                deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTtsMessages', 'ManageChannels', 'MentionEveryone', 'ViewChannel']
            }]
        })
        await channel.setParent("603606059084546094", {lockPermissions: false}).catch(() => {
            channel.setParent("603606059084546094", {lockPermissions: false});
        });
        channel.send({
            embeds: [new EmbedBuilder()
                .setTitle(`📌 | Мероприятия для модераторов`)
                .setColor(Colors.DarkRed)
                .setTimestamp()
                .setDescription(`**\` Доброго времени суток. Этот канал создан для проведения мероприятий для модераторов. Ожидайте начала мероприятия. Также слушайтесь указов организатора!\`**`)
                .addFields({
                    name: `**\`Организатор Мероприятия:\`**`, value: author, inline: true
                }, {
                    name: `**\`Что запрещено на мероприятии:\`**`,
                    value: '\**`1. - Вести себя неадекватно!`**\n' + '\**`2. - Оскорблять участников или организатора Мероприятия!`**\n' + '\**`3. - Игнорировать организатора.`**\n' + '\**`4. - Покидать Мероприятие не предупредив Организатора`**\n' + '\**В случае неадекватного поведения вы можете быть [сняты/понижены] с поста модератора!**\n' + '\**UPD: система может притормаживать...**\n'
                })]
        })

        const channelManagers = await guild.channels.create(`mp-руководство`, {
            type: 'GUILD_TEXT', permissionOverwrites: [{
                id: guild.id,
                allow: ['SendMessages'],
                deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhook', 'SendTtsMessages', 'ManageMessages', 'MentionEveryone', 'ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions']
            }, {
                id: rolesId.juniorDiscordMaster,
                allow: ['ViewChannel', 'EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'SendMessages', 'ManageChannels', 'CreateInstantInvite', 'ManageRoles', 'ManageWebhooks', 'SendTtsMessages', 'ManageMessages', 'MentionEveryone'],
            }, {
                id: rolesId.adviceAdministration,
                allow: ['EmbedLinks', 'AttachFiles', 'ReadMessageHistory', 'UseExternalEmojis', 'AddReactions', 'ViewChannel', 'SendMessages', 'MentionEveryone', 'ManageMessages'],
                deny: ['CreateInstantInvite', 'ManageChannels', 'ManageRoles', 'ManageWebhooks', 'SendTtsMessages', 'ManageMessages']
            }]
        })
        await channelManagers.setParent(categories.moders, {lockPermissions: false}).catch(() => {
            channel.setParent(categories.moders), {lockPermissions: false};
        });
        channelManagers.send({
            embeds: [new EmbedBuilder()
                .setColor(Colors.Blue)
                .setTitle("**Управление Мероприятием**")
                .setDescription("**Подождите, идет загрузка сообщения**")
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                })]
        }).then(async msg => {
            await msg.react('💥')
            await msg.react('⏯')
            await msg.react('⏹')
            await msg.react('💎')
            await msg.react('⏸')
            msg.edit({
                embeds: [new EmbedBuilder()
                    .setTitle(`📌 | Мероприятия для модераторов`)
                    .setColor(Colors.DarkRed)
                    .setTimestamp()
                    .setDescription(`**Дистанционное управление Мероприятием**`)
                    .addFields({
                        name: `**ВНИМАНИЕ**`,
                        value: '**`💥 - НАЧАТЬ мероприятие`**\n' + '\**`⏯ - Возобновить мероприятие после паузы!`**\n' + '\**`⏹ - Закрыть/Удалить мероприятие`**\n' + '\**`💎 - Созвать модераторов на мероприятие`**\n' + '\**`⏸ - Остановить мероприятие (на время)`**\n'
                    })]
            })
            interaction.reply({content: '**`Каналы для мероприятий успешно созданы!`**'});

        })
    },
};
