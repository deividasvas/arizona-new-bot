const {Colors} = require("discord.js");
const {EmbedBuilder} = require("discord.js");
const {scheduleJob} = require("node-schedule");
const {getGuildRolesId, getGuildChannelsId} = require("../configs/settings");
const Punishment = require("../models/Punishment");
const convertMinutesToMs = require("./convertMinutesToMs");
const sendUserMessage = require("./sendUserMessage");
const unmute = require("./unmute");
const LogDataBase = require("../models/LogDataBase");
const setModerInfoParam = require("../components/setModerInfoParam");
const settings = require("../configs/settings");
const getModerInfo = require("./getModerInfo");
const updateModeratorTask = require("./updateModeratorTask");
const log = require('./log');


// Функция мутит пользователей.
const mute = async (bot, guildId, userId, provocateurId, minutes, reason) => {
    const rolesId = getGuildRolesId(guildId);
    const channelsId = getGuildChannelsId(guildId);

    const punish = await Punishment.findOne({
        userId,
    });
    if (punish?.action === "mute") {
        // если уже существует мут, то ничего не делаем
        if (punish.dateEnd <= new Date()) {
            // мут уже должен пройти, но мы выдадим новый
            punish.remove();
        } else {
            return null;
        }
    }
    const guild = bot.guilds.cache.get(guildId);
    const provocateur = guild.members.cache.get(provocateurId);
    const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));
    member.timeout(
        convertMinutesToMs(minutes),
        `${reason} by ${provocateur.user.tag}`
    ); // выдаём мут человеку системно
    // Логируем мут в базу данных.
    log(2, {
        guildId: guild.id, // ID сервера
        discordId: userId, // ID упомянутого участника
        discordTag: member.user.tag, // Tag упомянутого участника
        discordNick: member.displayName, // Серверный ник упомянутого участника
        moderatorId: provocateurId, // ID автора сообщения
        moderatorTag: provocateur.user.tag, // Tag автора сообщения
        moderatorNick: provocateur.displayName, // Серверный ник автора сообщения
        reason,
    });
    // Выдаём мут пользователю дополнительно при помощи роли чтоб другие могли это видеть.
    member.roles.add(rolesId.muted);
    const dateEnd = new Date();
    dateEnd.setMinutes(dateEnd.getMinutes() + minutes);
    // Логируем текущее наказание в базу данных.
    const newPunish = new Punishment({
        action: "mute",
        moderatorId: provocateurId,
        userId,
        guildId: guild.id,
        reason,
        dateEnd,
    });
    await newPunish.save();
    // выдаем недельные муты и общие
    await setModerInfoParam(
        provocateurId,
        guildId,
        "main",
        "mutes",
        ({mutes}) => mutes + 1
    );
    await setModerInfoParam(
        provocateurId,
        guildId,
        "week",
        "mutes",
        ({mutes}) => mutes + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
        provocateurId,
        guildId,
        "main",
        "balls",
        ({balls, coefficient, rates}) => balls + (rates.mute * coefficient)
    );
    await setModerInfoParam(
        provocateurId,
        guildId,
        "week",
        "balls",
        ({balls, coefficient, rates}) => balls + rates.mute * coefficient
    );
    const { task } = await getModerInfo(bot, guildId, provocateurId);
    // Обновляем модератору задание если у него оно активно
    if (task.status === 'active') {
        await updateModeratorTask(provocateurId, guildId, {
            ...task,
            // если отнять от текущего состояния наказание, то проверяем будет ли ноль или меньше
            // если будет, то пишем ноль, если нет, то общее кол-во наказаний минус один
            mutes: task.mutes - 1 <= 0 ? 0 : task.mutes - 1
        })
    }
    console.log(dateEnd);
    scheduleJob(`${guildId}-${userId}-mute-${reason}`, dateEnd, () => {
        console.log(`unmuteeeee`)
        unmute(bot, guildId, userId, "-"); // ставим отслеживание на мут до определённое времени конца наказания.
        const guild = bot.guilds.cache.get(guildId);
        const moderationLog = guild.channels.cache.get(channelsId.moderationLog); // канал куда отправляем сообщение о снятии мута
        moderationLog.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Система снятия мута!`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Выдавал: <@${provocateur.id}>\n「📌」Кому: <@${userId}>\n 「📕」Причина выдачи мута: \`${reason}\`\n「📛」Мут снят!**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        }); // отправляем в этот канал сообщение о снятии мута

        sendUserMessage(
            {
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(`📌 | Система снятия мута!`)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдавал: <@${provocateur.id}>\n「📕」Причина: \`${reason}\`\n「📛」Мут снят!**`
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
        // снимаем мут как приходит время
    });

    return true;
};

module.exports = mute;
