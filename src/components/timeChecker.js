/*
    Класс благодаря которому работает по большей части система безопасности.
    Всё основывается на том, что если модератор выдал более 5 какого-то типа наказаний,
    то на него жалуется система безопасности кураторам в их канал с пингом совета и кураторов.
    Данный класс обеспечивает команды наказаний возможностью следить за выдачей наказаний.
*/

const {getGuildChannelsId, getGuildRolesId} = require("../configs/settings");
const {EmbedBuilder, Colors} = require("discord.js");
const bot = require("../index");
const getMinutesInMs = require("./getMinutesInMs");

class timeChecker {
    constructor(typePunish) {
        this.typePunish = typePunish; // кик / бан / мут / снятие роли
        this.logs = {}; // объект с информацией по выданным наказания модератора
        setInterval(() => {
            // каждые пол минуты делаем проверку на то, прошло ли более 5 минут с момента выдачи последнего мута
            // если да, то нужно вынести человека из списка анти слива
            for (const serverId of Object.keys(this.logs)) {
                const log = this.logs[serverId]; // объект с информацией модераторов по выданному наказанию

                for(const key of Object.keys(log)){
                    const moderatorInfoMutes = log[key]; // информация по выданным наказаниям.
                    if(!moderatorInfoMutes){
                        continue;
                    }
                    const minutes = (new Date() - moderatorInfoMutes.date) / 60000; // количество минут которые прошли с момента выдачи мута
                    if(minutes >= 5){
                        delete log[key]; // если прошло более 5 минут, то удаляем.
                    }
                }
            }
        }, getMinutesInMs(0.1));
    }

    addModeratorPunish(moderatorId, guildId) {
        // Функция добавляет модератора в список информации по наказаниям.
        // Если модератор уже есть там, то добавляет ещё одно наказание в статистику.
        // Если у него более 5 выданных наказаний за 5 минут, то на него отправляется эмбед
        // в канал кураторов с их упоминанием и совета.

        const guild = bot.guilds.cache.get(guildId);
        const channelsId = getGuildChannelsId(guildId);
        const rolesId = getGuildRolesId(guildId);
        // Смотрим, есть ли модератор и установленный сервер в закреплённом списке информации по наказаниям.
        if (!this.logs[guildId]) {
            this.logs[guildId] = {}; // устанавливаем изначальное значение серверу если его нет.
        }
        const guildLogs = this.logs[guildId];
        if (!guildLogs || !guildLogs[moderatorId]) {
            // Если нет, то устанавливаем на него изначальную статистику
            guildLogs[moderatorId] = {
                count: 1, // количество выданных наказаний за 5 минут
                date: new Date(), // дата выдачи последнего наказания
            }
            return true;
        }

        // Если есть, то добавляем ему ещё одно выданное наказание.
        const currentModeratorInfo = guildLogs[moderatorId];
        guildLogs[moderatorId] = {
            count: currentModeratorInfo.count + 1, // устанавливаем ещё одно выданное наказание
            date: new Date(), // устанавливаем дату последнего выданного наказания
        }

        // Как только добавили ещё одно выданное наказание - смотрим сколько у него в итоге текущих наказаний.
        // Если их более 5, то логируем об этом в канал кураторов.
        if (currentModeratorInfo.count >= 5) {
            const curatorsModerationChannel = guild.channels.cache.get(channelsId.curators);
            return curatorsModerationChannel.send({
                content: `<@&${rolesId.curatorModeration}> <@&${rolesId.adviceAdministration}>`,
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Система безопасности`)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setDescription(`**Модератор <@${moderatorId}> выдал более 5 наказаний за 5 минут. Тип наказания: \`${this.typePunish}\`.**`)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),

                ]
            })
        }
    }
}

module.exports = timeChecker;