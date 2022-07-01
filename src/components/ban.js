const {Colors, EmbedBuilder} = require("discord.js");
const {scheduleJob} = require("node-schedule");
const {getGuildChannelsId} = require("../configs/settings");
const Punishment = require("../models/Punishment");
const unban = require("./unban");
const updateModeratorTask = require("./updateModeratorTask");
const getModerInfo = require("./getModerInfo");
const setUserCoinsParam = require("./setUserCoinsParam");
const sendUserMessage = require("./sendUserMessage");
const getCoinsProfile = require("./getCoinsProfile");
const log = require("../components/log");

/*
  Функция для выдачи блокировки пользователю. Используется в mban.js
*/

const ban = async (bot, guildId, userId, provocateurId, days, reason) => {
    const punish = await Punishment.findOne({
        userId,
        action: "ban",
    });
    const channelsId = getGuildChannelsId(guildId);
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

    const { compensations } = await getCoinsProfile(userId, guildId);

    const banCompensations = compensations.map(compensation => compensation._doc).filter(compensation => compensation.type === 'immunityBan5');
    if(banCompensations.length === 0){
        await guild.bans.create(userForBan, {
            days,
            reason: `${reason} by ${provocateur.user.tag}`,
        }).catch(() => {});
    }

    // Общее количество дней бана которое может быть сохранено
    const daysBanSafe = banCompensations.reduce((totalBanCompensation, currentBanCompensation) => typeof totalBanCompensation === 'number' ? totalBanCompensation + Number(currentBanCompensation.timeValue) : Number(totalBanCompensation.timeValue) + Number(currentBanCompensation.timeValue));

    const isSafe = daysBanSafe > days || daysBanSafe === days;

    if(daysBanSafe < days){
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`😞️ | Не совсем повезло-повезло`)
                    .setDescription(`**Вам было выдано наказание "Блокировка на \`${days}\` дня(ей)", но, на него сработал иммунитет частично!\nБлокировка будет действовать вместо \`${days}\` дней - \`${days - daysBanSafe} дня(ей)\`, иммунитет снят.**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        }, userId, guild);
        await guild.bans.create(userForBan, {
            days: days - daysBanSafe,
            reason: `${reason} by ${provocateur.user.tag}`,
        }).catch(() => {});
    }

    if(daysBanSafe > days){
        await setUserCoinsParam(userId, guild.id, 'compensations', ({compensations}) => {
            // Получаем индекс кика, чтобы удалить её из БД.
            const removeCompensation = () => {
                const index = compensations.findIndex(compensation => {
                    return compensation.type === 'immunityBan5';
                });
                // Если индекс не найден, то просто возвращаем текущий массив.
                if (index === -1) return compensations;
                // Если индекс найден, то удаляем его из массива и возвращаем уже новый массив.
                delete compensations[index];
            }
            // Удаляем компенсации с баном до тех пор, пока не окупиться количество снятых дней бана.
            // формула (количество_дней_бана - сохраненное_количество_дней_бана) / количество_дней_бана_которое_сейвит_один_элемент
            // (20 - 30) / 5 = 2, нужно две компенсации удалить.

            for(let i = 0; i < (daysBanSafe - days) / 5; i++){
                removeCompensation();
            }

            return compensations.filter(compensation => !!compensation);
        });
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`😋️ | Повезло-повезло`)
                    .setDescription(`**Вам было выдано наказание "Блокировка на \`${days}\` дней", но, на него сработал иммунитет!\nНаказание недействительно, иммунитеты которые окупили дни бана сняты.**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        }, userId, guild);
    }

    if(days === daysBanSafe){
        await setUserCoinsParam(userId, guild.id, 'compensations', ({compensations}) => {
            // Получаем индекс кика, чтобы удалить её из БД.
            const removeCompensation = () => {
                const index = compensations.findIndex(compensation => {
                    return compensation.type === 'immunityBan5';
                });
                // Если индекс не найден, то просто возвращаем текущий массив.
                if (index === -1) return compensations;
                // Если индекс найден, то удаляем его из массива и возвращаем уже новый массив.
                delete compensations[index];
            }
            // Удаляем все компенсации банов, потому, что, они окупают текущие дни бана.
            for(let i = 0; i < compensations.filter(compensation => compensation.type === 'immunityBan5').length; i++){
                removeCompensation();
            }

            return compensations.filter(compensation => !!compensation);
        });
        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`😋️ | Повезло-повезло`)
                    .setDescription(`**Вам было выдано наказание "Блокировка на \`${days}\` дней", но, на него сработал иммунитет!\nНаказание недействительно, иммунитеты которые окупили дни бана сняты.**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL()
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ]
        }, userId, guild);
    }

    await log(42, {
        guildId, // ID сервера
        discordId: userForBan.id, // ID упомянутого участника
        discordTag: userForBan.user.tag, // Tag упомянутого участника
        discordNick: userForBan.displayName, // Серверный ник упомянутого участника
        value: `BAN | ${JSON.stringify(banCompensations[0])} | ${days}`
    })

    dateEnd.setDate(dateEnd.getDate() + days);
    if(!isSafe){
        await Punishment.deleteMany({
            userId,
            guildId,
        });
        const newPunish = new Punishment({
            action: "ban",
            moderatorId: provocateur.id,
            userId,
            guildId,
            reason,
            dateEnd,
        });
        await newPunish.save();
    }

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
    if(isSafe){
        return;
    }
    // удаляем все наказания пользователя, чтобы не было парадокса что когда человек заходит на сервер, то у него ещё мут висит
    scheduleJob(`${guildId}-${userId}-ban-${reason}`, dateEnd, async () => {
        await unban(bot, guildId, userId); // Ставим отслеживание на бан до определённое времени конца наказания.
        // Снимаем бан как приходит время
        const bansLogsChannel = guild.channels.cache.get(channelsId.rolesAndBans);
        bansLogsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
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
};

module.exports = ban;
