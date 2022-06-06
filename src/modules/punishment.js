const { Colors, EmbedBuilder } = require("discord.js");
const unban = require("../components/unban");
const unmute = require("../components/unmute");
const { getGuildChannelsId } = require("../configs/settings");
const Punishment = require("../models/Punishment");
const unSupportBlock = require("../components/unSupportBlock");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того чтобы снимать наказания когда приходит время.
    */
    autoRun: true, // автоматический запуск модуля
    name: "punishment", // имя модуля
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    run: async ({bot}) => {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        const settings = [
            {
                action: "ban", // Действие по отношению к которому будет идти слежка.
                wordOnTitle: "блокировки", // Слово, которое будет использоваться в заголовке.
                wordOnDescription: "Блокировка", // Слово, которое будет использоваться в описании. (С большой буквы и в именительном падеже)
                func: unban, // Функция снятия наказания
                logChannelId: guildId => getGuildChannelsId(guildId).rolesAndBans, // Канал в который будет логироватся снятие наказания.
            },
            {
                action: "mute", // Действие по отношению к которому будет идти слежка.
                wordOnTitle: "мута", // Слово, которое будет использоваться в заголовке.
                wordOnDescription: "Мут", // Слово, которое будет использоваться в описании. (С большой буквы и в именительном падеже)
                func: unmute, // Функция снятия наказания
                logChannelId: guildId => getGuildChannelsId(guildId).moderationLog, // Канал в который будет логироватся снятие наказания.
            },
            {
                action: "unsupport-block", // Действие по отношению к которому будет идти слежка.
                wordOnTitle: "блокировки саппорта", // Слово, которое будет использоваться в заголовке.
                wordOnDescription: "Блокировка саппорта", // Слово, которое будет использоваться в описании. (С большой буквы и в именительном падеже)
                func: unSupportBlock, // Функция снятия наказания
                logChannelId: guildId => getGuildChannelsId(guildId).administrationCouncil, // Канал в который будет логироватся снятие наказания.
            },

        ]

        for (const setting of settings) {
            const punishes = await Punishment.find({
                action: setting.action
            });
            for (const punish of punishes) {
                const guild = bot.guilds.cache.get(punish.guildId);
                const logChannel = guild.channels.cache.get(setting.logChannelId(guild.id));

                // Проверяем, прошло ли уже время когда нужно было снять наказание
                if (punish.dateEnd > new Date()) {
                    // если не прошло, то просто пропускаем итерацию.
                    continue;
                }
                // если прошло, то снимаем наказание.
                logChannel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Blue)
                            .setTitle(`📌 | Система снятия ${setting.wordOnTitle}a!`)
                            .setAuthor({
                                name: guild.name,
                                iconURL: guild.iconURL(),
                            })
                            .setDescription(
                                `**「📝」Выдавал: <@${punish.moderatorId}>\n「📌」Кому: <@${punish.userId}>\n 「📕」Причина: \`${punish.reason}\`\n「📛」${setting.wordOnDescription} снят!**`
                            )
                            .setTimestamp()
                            .setFooter({
                                text: `Robo Hamster`,
                                iconURL: bot.user.displayAvatarURL(),
                            }),
                    ],
                });

                if(punish.action !== 'ban'){
                    await sendUserMessage(
                      {
                          embeds: [
                              new EmbedBuilder()
                                .setColor(Colors.Blue)
                                .setTitle(`📌 | Система снятия ${settin.wordOnTitle}!`)
                                .setAuthor({
                                    name: guild.name,
                                    iconURL: guild.iconURL(),
                                })
                                .setDescription(
                                  `**「📝」Выдавал: <@${punish.authorId}>\n「📕」Причина: \`${punish.reason}\`\n「📛」${setting.wordOnDescription} снят!**`
                                )
                                .setTimestamp()
                                .setFooter({
                                    text: `Robo Hamster`,
                                    iconURL: bot.user.displayAvatarURL(),
                                }),
                          ],
                      },
                      punish.userId,
                      guild
                    );
                }

                return setting.func(bot, punish.guildId, punish.userId, '-', "Автоматически снятие наказаний")
            }
        }
    },
};
