const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const sendUserMessage = require("../../components/sendUserMessage");
const getCoinsProfile = require("../../components/getCoinsProfile");
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const isActiveNickCustomFont = require('../../components/isActiveSendEmojiAndStickersFromOtherServers')
const log = require("../../components/log");
module.exports = {
    name: "nick-delete", // название команды
    descr: "Убрать пользователя из списка людей которым доступно использование нестандартного шрифта", // описание команды
    perms: (rolesId) => [
        rolesId.discordMaster,
        rolesId.juniorDiscordMaster,
    ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Пользователь которому будет выдана привилегия использовать нестандартный шрифт",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ], // аргументы

    async run({bot, interaction, args, author, guild}) {
        const userId = args[0];
        if (!(await isActiveNickCustomFont(userId, guild.id))) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**<@${userId}> не имеет привилегию использовать нестандартный шрифт в нике.**`
                        )
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }
        await setUserCoinsParam(userId, guild.id, 'customFontInNicknameSettings', null);
        const member = guild.members.cache.get(userId);
        log(17, {
            guildId: guild.id, // ID сервера
            discordId: member.id, // ID упомянутого участника
            discordTag: member.user.tag, // Tag упомянутого участника
            discordNick: member.displayName, // Серверный ник упомянутого участника
            moderatorId: author.id, // ID автора сообщения
            moderatorTag: author.user.tag, // Tag автора сообщения
            moderatorNick: author.displayName, // Серверный ник автора сообщения
        })
        interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Удаление из базу данных!")
                    .setDescription(
                        `**Пользователь <@${userId}>, был удален из базы данных нестандартных шрифтов в нике**`
                    )
                    .setColor(Colors.Blue)
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
        await sendUserMessage({
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Утрата возможности!")
                    .setDescription(
                        `**Администратор ${author} убрал Вам право использовать нестандартный шрифт в никнейме**`
                    )
                    .setColor(Colors.Blue)
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
        }, userId, guild);
    },
};
