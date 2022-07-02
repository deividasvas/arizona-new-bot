const {Colors} = require("discord.js");
const {EmbedBuilder} = require("discord.js");
const {scheduleJob} = require("node-schedule");
const {getGuildRolesId, getGuildChannelsId} = require("../configs/settings");
const Punishment = require("../models/Punishment");
const convertMinutesToMs = require("./convertMinutesToMs");
const sendUserMessage = require("./sendUserMessage");
const unmute = require("./unmute");
const setModerInfoParam = require("../components/setModerInfoParam");
const getModerInfo = require("./getModerInfo");
const updateModeratorTask = require("./updateModeratorTask");
const log = require('./log');
const setUserCoinsParam = require("./setUserCoinsParam");
const getCoinsProfile = require("./getCoinsProfile");


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
    const { compensations } = await getCoinsProfile(userId, guildId);
    // Если у человека есть иммунитет, то не выдаем мут и снимаем иммунитет.
    const isSafe = compensations.find(compensation => compensation.type === 'immunityMute');
    if(!isSafe){
        // выдаём мут человеку системно
        member.timeout(
            convertMinutesToMs(minutes),
            `${reason} by ${provocateur.user.tag}`
        );
        // Выдаём мут пользователю дополнительно при помощи роли чтоб другие могли это видеть.
        member.roles.add(rolesId.muted);
    } else {
        await setUserCoinsParam(userId, guild.id, 'compensations', ({compensations}) => {
            // Получаем индекс компенсации мута, чтобы удалить её из БД.
            const index = compensations.findIndex(compensation => {
                return compensation.type === 'immunityMute';
            });
            // Если индекс не найден, то просто возвращаем текущий массив.
            if (index === -1) return compensations;
            // Если индекс найден, то удаляем его из массива и возвращаем уже новый массив.
            delete compensations[index];
            return compensations.filter(compensation => !!compensation);
        });
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`😋️ | Повезло-повезло`)
                    .setDescription(`**Вам было выдано наказание "Мут на \`${minutes}\` минут", но, на него сработал иммунитет!\nНаказание недействительно, иммунитет снят.**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        }, userId, guild);
        await log(42, {
            guildId, // ID сервера
            discordId: member.id, // ID упомянутого участника
            discordTag: member.user.tag, // Tag упомянутого участника
            discordNick: member.displayName, // Серверный ник упомянутого участника
            value: `MUTE | ${JSON.stringify(compensations.find(compensation => compensation.type === 'immunityMute'))} | ${minutes}`
        })
    }
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
        value: isSafe ? `Наказание не было выдано. Имелся иммунитет от мута!` : ""
    });
    const dateEnd = new Date();
    dateEnd.setMinutes(dateEnd.getMinutes() + minutes);
    // Логируем текущее наказание в базу данных.
    if(!isSafe){
        const newPunish = new Punishment({
            action: "mute",
            moderatorId: provocateurId,
            userId,
            guildId: guild.id,
            reason,
            dateEnd,
        });
        await newPunish.save();
    }
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
    if(isSafe){
        return;
    }
    scheduleJob(`${guildId}-${userId}-mute-${reason}`, dateEnd, () => {
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
                        text: `Surprise Bot`,
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
                            text: `Surprise Bot`,
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
