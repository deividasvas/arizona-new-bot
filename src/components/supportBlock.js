const {Colors} = require("discord.js");
const {EmbedBuilder} = require("@discordjs/builders");
const {scheduleJob} = require("node-schedule");
const {rolesId, channelsId} = require("../configs/settings");
const Punishment = require("../models/Punishment");
const sendUserMessage = require("./sendUserMessage");
const unSupportBlock = require("./unSupportBlock");
const LogDataBase = require("../models/LogDataBase");

// Функция блокирует пользователям возможность писать тикеты.
const supportBlock = async (bot, guildId, userId, provocateur, days, reason) => {
    const punish = await Punishment.findOne({
        userId,
        action: "support-block",
    });
    if (punish) {
        // если уже существует саппорт блок, то ничего не делаем
        if (punish.dateEnd <= new Date()) {
            // саппорт блок уже должен пройти, но мы выдадим новый.
            punish.remove();
        } else {
            return null;
        }
    }
    const guild = bot.guilds.cache.get(guildId);
    const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));

    member.roles.add(rolesId.supportBlock);
    const dateEnd = new Date();
    dateEnd.setDate(dateEnd.getMinutes() + days);
    const newPunish = new Punishment({
        action: "support-block",
        moderatorId: provocateur.id,
        userId,
        guildId: guild.id,
        reason,
        dateEnd,
    });
    await newPunish.save();
    scheduleJob(`${guildId}-${userId}-support-block-${reason}`, dateEnd, () => {
        unSupportBlock(bot, userId, "-"); // ставим отслеживание на саппорт блок до определённое времени конца наказания.
        const guild = bot.guilds.cache.get(guildId);
        const logChannel = guild.channels.cache.get(channelsId.administrationCouncil); // канал куда отправляем сообщение о снятии мута
        logChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`📌 | Система снятия саппорт блока!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Выдавал: <@${provocateur.id}>\n「📌」Кому: <@${userId}>\n 「📕」Причина: \`${reason}\`\n「📛」Саппорт блок снят!**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        }); // отправляем в этот канал сообщение о снятии саппорт блока

        sendUserMessage(
            {
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setTitle(`📌 | Система снятия саппорт блока!`)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдавал: <@${provocateur.id}>\n「📕」Причина: \`${reason}\`\n「📛」Саппорт блок снят!**`
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            },
            userId,
            guild
        );
        // снимаем саппорт блок как приходит время
    });
    return true;
};

module.exports = supportBlock;
