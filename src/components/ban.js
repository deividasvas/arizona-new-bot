const {Colors, EmbedBuilder} = require("discord.js");
const {scheduleJob} = require("node-schedule");
const {channelsId} = require("../configs/settings");
const Punishment = require("../models/Punishment");
const unban = require("./unban");
const setModerInfoParam = require("../components/setModerInfoParam");
const settings = require("../configs/settings");
const updateModeratorTask = require("./updateModeratorTask");
const getModerInfo = require("./getModerInfo");

/*
  Функция для выдачи блокировки пользователю. Используется в mban.js
*/

const ban = async (bot, guildId, userId, provocateurId, days, reason) => {
    const punish = await Punishment.findOne({
        userId,
        action: "ban",
    });
    if (punish) {
        return null;
    }
    const guild = bot.guilds.cache.get(guildId);
    const provocateur = guild.members.cache.get(provocateurId);
    const dateEnd = new Date();
    const userForBan = await bot.users.fetch(userId);
    if (!userForBan) {
        return null;
    }
    await guild.bans.create(userForBan, {
        days,
        reason: `${reason} by ${provocateur.user.tag}`,
    });
    dateEnd.setDate(dateEnd.getDate() + days);
    const newPunish = new Punishment({
        action: "ban",
        moderatorId: provocateur.id,
        userId,
        guildId,
        reason,
        dateEnd,
    });
    await newPunish.save();
    await Punishment.deleteMany({
        userId,
        guildId,
    });
    await setModerInfoParam(
        provocateurId,
        guildId,
        "main",
        "bans",
        ({bans}) => bans + 1
    );
    await setModerInfoParam(
        provocateurId,
        guildId,
        "week",
        "bans",
        ({bans}) => bans + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
        provocateurId,
        guildId,
        "main",
        "balls",
        ({balls, coefficient}) => balls + settings.rates.ban * coefficient
    );
    await setModerInfoParam(
        provocateurId,
        guildId,
        "week",
        "balls",
        ({balls, coefficient}) => balls + settings.rates.ban * coefficient
    );
    const { task } = await getModerInfo(bot, guildId, provocateurId);
    // Обновляем модератору задание если у него оно активно
    if (task.status === 'active') {
        await updateModeratorTask(provocateurId, guildId, {
            ...task,
            // если отнять от текущего состояния наказание, то проверяем будет ли ноль или меньше
            // если будет, то пишем ноль, если нет, то общее кол-во наказаний минус один
            bans: task.bans - 1 <= 0 ? 0 : task.bans - 1
        })
    }
    // удаляем все наказания пользователя, чтобы не было парадокса что когда человек заходит на сервер, то у него ещё мут висит
    scheduleJob(`${guildId}-${userId}-ban-${reason}`, dateEnd, async () => {
        await unban(bot, guildId, userId); // Ставим отслеживание на бан до определённое времени конца наказания.
        // Снимаем бан как приходит время
        const bansLogsChannel = guild.channels.cache.get(channelsId.rolesAndBans);
        bansLogsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`📌 | Система автоматической разблокировки!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Запрашивал: ${provocateur} \n「📌」Кому: <@${userId}>\n 「📕」Причина: \`${reason}\`\n「📛」Блокировка снята!**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
    });
    return null;
};

module.exports = ban;
