const { Colors, EmbedBuilder } = require("discord.js");
const { scheduleJob } = require("node-schedule");
const unban = require("../components/unban");
const unmute = require("../components/unmute");
const { channelsId } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const unSupportBlock = require("../components/unSupportBlock");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того чтобы снимать наказания когда приходит время.
    */
    name: "punishment", // имя модуля
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    run: async ({bot}) => {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

        const settings = [
            {
                action: "ban", // Действие по отношению к которому будет идти слежка.
                word: "блокировки", // Слово, которое будет использоваться в заголовке и описании эмбеда.
                func: unban, // Функция снятия наказания
                logChannelId: channelsId.rolesAndBans, // Канал в который будет логироватся снятие наказания.
            },
            {
                action: "mute", // Действие по отношению к которому будет идти слежка.
                word: "мута", // Слово, которое будет использоваться в заголовке и описании эмбеда.
                func: unmute, // Функция снятия наказания
                logChannelId: channelsId.moderationLog, // Канал в который будет логироватся снятие наказания.
            },
            {
                action: "unsupport-block", // Действие по отношению к которому будет идти слежка.
                word: "блокировки саппорта", // Слово, которое будет использоваться в заголовке и описании эмбеда.
                func: unSupportBlock, // Функция снятия наказания
                logChannelId: channelsId.administrationCouncil, // Канал в который будет логироватся снятие наказания.
            },
        ]

        for (const setting of settings) {
            const punishs = await Punishment.find({
                action: setting.action
            });
            for (const punish of punishs) {
                const guild = bot.guilds.cache.get(punish.guildId);
                const logChannel = guild.channels.cache.get(setting.logChannelId);

                // Проверяем, прошло ли уже время когда нужно было снять наказание
                if (punish.dateEnd > new Date()) {
                    // если не прошло, то просто пропускаем итерацию.
                    continue;
                }
                // если прошло, то снимаем наказание.
                logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.DarkGreen)
                            .setTitle(`📌 | Система снятия ${setting.word}!`)
                            .setAuthor({
                                name: guild.name,
                                iconURL: guild.iconURL(),
                            })
                            .setDescription(
                                `**「📝」Выдавал: <@${punish.moderatorId}>\n「📌」Кому: <@${punish.userId}>\n 「📕」Причина: \`${punish.reason}\`\n「📛」${setting.word} снята!**`
                            )
                            .setTimestamp()
                            .setFooter({
                                text: `Robo Hamster`,
                                iconURL: bot.user.displayAvatarURL(),
                            }),
                    ],
                });
                return setting.func(bot, punish.guildId, punish.userId, '-', "Автоматически снятие наказаний")
            }
        }
    },
};
