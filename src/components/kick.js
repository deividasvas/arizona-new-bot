const setModerInfoParam = require("./setModerInfoParam");
const settings = require("../configs/settings");
const getModerInfo = require("./getModerInfo");
const updateModeratorTask = require("./updateModeratorTask");
const log = require('./log');
const getCoinsProfile = require("./getCoinsProfile");
const setUserCoinsParam = require("./setUserCoinsParam");
const sendUserMessage = require("./sendUserMessage");
const {EmbedBuilder, Colors} = require("discord.js");

// Функция кикает с сервера.
const kick = async (bot, guildId, userId, provocateurId, reason) => {
    const guild = bot.guilds.cache.get(guildId);
    const provocateur = guild.members.cache.get(provocateurId);
    const member =
        guild.members.cache.get(userId) || (await guild.members.fetch(userId));
    const { compensations } = await getCoinsProfile(userId, guildId);
    // Если у человека есть иммунитет, то не кикаем и снимаем иммунитет.
    const isSafe = !!compensations.find(compensation => compensation.type === 'immunityKick');
    if(!isSafe){
        member.kick(`${reason} by ${provocateur.user.tag}`);
    } else {
        await setUserCoinsParam(userId, guild.id, 'compensations', ({compensations}) => {
            // Получаем индекс кика, чтобы удалить её из БД.
            const index = compensations.findIndex(compensation => {
                return compensation.type === 'immunityKick';
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
                  .setDescription(`**Вам было выдано наказание "Кик с сервера", но, на него сработал иммунитет!\nНаказание недействительно, иммунитет снят.**`)
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
        await log(42, {
            guildId, // ID сервера
            discordId: member.id, // ID упомянутого участника
            discordTag: member.user.tag, // Tag упомянутого участника
            discordNick: member.displayName, // Серверный ник упомянутого участника
            value: `KICK | ${JSON.stringify(compensations.find(compensation => compensation.type === 'immunityKick'))}`
        })
    }

    // Логируем кик в базу данных.
    log(1, {
        guildId: guild.id, // ID сервера
        discordId: userId, // ID упомянутого участника
        discordTag: member.user.tag, // Tag упомянутого участника
        discordNick: member.displayName, // Серверный ник упомянутого участника
        moderatorId: provocateurId, // ID автора сообщения
        moderatorTag: provocateur.user.tag, // Tag автора сообщения
        moderatorNick: provocateur.displayName, // Серверный ник автора сообщения
        reason,
        value: isSafe ? `Наказание не было выдано. Имелся иммунитет от кика!` : ""
    });
    // выдаем недельные муты и общие

    const {task} = await getModerInfo(bot, guildId, provocateurId);
    // Обновляем модератору задание если у него оно активно
    if (task.status === 'active') {
        await updateModeratorTask(provocateurId, guildId, {
            ...task,
            // если отнять от текущего состояния наказание, то проверяем будет ли ноль или меньше
            // если будет, то пишем ноль, если нет, то общее кол-во наказаний минус один
            kicks: task.kicks - 1 <= 0 ? 0 : task.kicks - 1
        })
    }

    await setModerInfoParam(
        provocateur.id,
        guildId,
        "main",
        "kicks",
        ({kicks}) => kicks + 1
    );
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "week",
        "kicks",
        ({kicks}) => kicks + 1
    );

    // выдаем недельные баллы и общие
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "main",
        "balls",
        ({balls, coefficient, rates}) => balls + rates.kick * coefficient
    );
    await setModerInfoParam(
        provocateur.id,
        guildId,
        "week",
        "balls",
        ({balls, coefficient, rates}) => balls + rates.kick * coefficient
    );
};

module.exports = kick;
