const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const kick = require("../../components/kick");
const sendUserMessage = require("../../components/sendUserMessage");
const setModerInfoParam = require("../../components/setModerInfoParam");
const settings = require("../../configs/settings");
const {
    rolesId, channelsId, whiteListRoles,
} = require("../../configs/settings");
const timeChecker = require("../../components/timeChecker");

const voiceKicks = new timeChecker('кик из голосового канала');

module.exports = {
    name: "mvkick", // название команды
    descr: "Исключить игрока из голосового канала", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [{
        name: "пользователь",
        description: "Пользователь которого Вы хотите исключить из канала",
        type: ApplicationCommandOptionType.User,
        required: true,
    }, {
        name: "причина",
        description: "Причина по которой Вы хотите исключить пользователя из канала",
        type: ApplicationCommandOptionType.String,
        required: true,
    },], // аргументы
    perms: () => getAllRolesIdModers(), // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args}) => {
        const userForVoiceKick = guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));
        const reason = args[1];

        const roleInWhiteList = userForVoiceKick.roles.cache.find((role) => whiteListRoles.includes(role.id)); // проверяем, есть ли у человека роль которая находится в белом списке по отношению к выдачам наказаний.
        if (roleInWhiteList) {
            // если у человека есть роль из белого списка ролей, то отвечаем запросившему что у пользователя роль из белого списка
            return interaction.reply({
                ephemeral: true, embeds: [new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**Пользователя ${userForVoiceKick} невозможно наказать потому, что, у него есть роль <@&${roleInWhiteList.id}> которая находится в белом списке.**`)
                    .setColor(Colors.Red)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }
        if (!userForVoiceKick.voice?.channel) {
            return interaction.reply({
                ephemeral: true, embeds: [new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**Пользователь ${userForVoiceKick} не находится в голосовом канале.**`)
                    .setColor(Colors.Red)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    }),

                ]
            })
        }
        await sendUserMessage({
            content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
            embeds: [new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Вы были исключены из голосового канала!`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setDescription(`**「📝」Исключил: <@${author.id}>\n「📕」Причина: \`${reason}\`**`)
                .setTimestamp()
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                }),],
        }, userForVoiceKick.id, guild); // отправляем в лс пользователю сообщение об исключений
        await userForVoiceKick.voice.disconnect(reason + " / " + author.displayName);
        const moderationLog = guild.channels.cache.get(channelsId.moderationLog);
        moderationLog.send({
            embeds: [new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Система исключения пользователей из голосового канала.`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setDescription(`**「📝」Исключил: <@${author.id}> (${author.user.tag})\n「📌」Кого: <@${userForVoiceKick.id}> (${userForVoiceKick.user.tag})\n「📕」Причина: \`${reason}\`**`)
                .setTimestamp()
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                }),],
        });

        interaction.reply({
            ephemeral: true, embeds: [new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Система исключения пользователей из голосового канала.`)
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setDescription(`**Вы успешно исключили пользователя ${userForVoiceKick} с голосового канала по причине \`${reason}\`**`)
                .setTimestamp()
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                }),],
        });
        // выдаем недельные баллы и общие
        await setModerInfoParam(author.id, guild.id, "main", "balls", ({
                                                                           balls,
                                                                           coefficient
                                                                       }) => balls + settings.rates.kick * coefficient);
        await setModerInfoParam(author.id, guild.id, "week", "balls", ({
                                                                           balls,
                                                                           coefficient
                                                                       }) => balls + settings.rates.kick * coefficient);
        voiceKicks.addModeratorPunish(author.id, guild.id);
    },
};
