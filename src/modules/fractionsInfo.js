const {EmbedBuilder, Colors} = require('discord.js')
const axios = require('axios')
const getMinutesInMs = require('../components/getMinutesInMs')
const {getGuildChannelsId, numbersServersByGuildId} = require('../configs/settings')
const api = require('../api/index')

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы загружать данные с API мятной плантации.
      По большей части, в эти данные входит онлайн фракции и информация о них.
    */
    autoRun: true, // автоматический запуск модуля
    name: 'fractionsInfo', // имя модуля
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    tags: {
        1: 'LSPD',
        2: 'RCSD',
        3: 'FBI',
        4: 'SFPD',
        5: 'LSMC',
        6: 'GOV',
        7: 'TCP', // английские буквы
        8: 'SFMC',
        9: 'ASH',
        10: 'LSFM',
        20: 'LSa',
        21: 'CB',
        22: 'LVMC',
        23: 'LVMPD',
        24: 'LVFM',
        26: 'SFFM',
        27: 'SFa',
        29: 'INS'
    }, // короткие теги организации
    async run({bot}) {
        // Команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        this.bot = bot // устанавливаем бота в общий объект чтоб можно было удобно взаимодействовать

        // Каждые пять минут обновляем информацию
        for (const [guildId, guild] of bot.guilds.cache) {
            await this.updateAllFractionsInfo(guildId) // инициализация данные информации об организациях
            await this.updateOnlineEmbed(guildId, guild) // инициализируем данные в эмбеде онлайн-фракции
        }

        setInterval(async () => {
            for (const [guildId, guild] of bot.guilds.cache) {
                await this.updateAllFractionsInfo(guildId) // обновляем данные информации об организациях
                await this.updateOnlineEmbed(guildId, guild) // обновляем данные в эмбеде онлайн-фракции
            }
        }, getMinutesInMs(5))
        console.log(`[📌 | Fractions]: Информация о фракциях была успешно загружена!`)
    }, // Функция обновления информации о фракции
    async updateFractionInfo(guildId, fractionId) {
        let serverId = numbersServersByGuildId[guildId];
        const request = await api.getFractionInfo(fractionId, serverId)
        // пытаемся найти уже существующий объект с организацией, если его нет, то создаём новый
        const {members} = request.data

        // Объект с возможно существующей информацией о фракции
        let fraction = this.bot.fractions.data[guildId].find(fraction => fraction.id === fractionId)
        if (!fraction) {
            // если объекта нет, то вставляем новый.
            this.bot.fractions.data[guildId].push({
                id: Number(fractionId),
                members,
                tag: this.tags[fractionId],
                online: members.filter(member => member.isOnline).length
            })
        } else {
            // Если есть, то просто редактируем. (Изменения благодаря тому что это метод find автоматически введутся).
            fraction = {
                id: fractionId,
                members,
                tag: this.tags[fractionId],
                online: members.filter(member => member.isOnline).length
            }
        }
    }, // Функция обновления информации о ВСЕХ организациях.
    async updateAllFractionsInfo(guildId) {
        // Айдишники всех организации.
        const fractionsId = Object.keys(this.tags)

        for (const fractionId of fractionsId) {
            await this.updateFractionInfo(guildId, fractionId)
        }
        this.bot.fractions.init = true
        this.bot.fractions.dateOldInit = new Date()
    }, // Функция для получения онлайна фракции при помощи тега организации.
    getOnlineFractionByTag(guildId, tag) {
        return this.bot.fractions.data[guildId].find(fraction => fraction.tag.toLowerCase() === tag.toLowerCase())?.online
    }, // Функция обновления эмбеда в канале онлайн-фракции.
    async updateOnlineEmbed(id, guild) {
        // Получаем все сообщения в канале
        // Все айди каналов сервера объектом.
        const channelsId = getGuildChannelsId(guild.id)
        const onlineFractionChannel = this.bot.channels.cache.get(channelsId.onlineFraction)
        const messageEmbed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle(`📌 | Онлайн фракции`)
            .setTimestamp()
            .setFooter({
                text: `Surprise Bot`, iconURL: this.bot.user.displayAvatarURL()
            })
            .addFields([
                {
                    name: '**Полиция Los-Santos**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LSPD')}\`**`,
                    inline: true
                }, {
                    name: '**Полиция San-Fierro**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'SFPD')}\`**`,
                    inline: true
                }, {
                    name: '**Полиция Red-Country**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'SFPD')}\`**`,
                    inline: true
                }, {
                    name: '**Полиция Las-Venturas**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LVMPD')}\`**`,
                    inline: true
                }, {
                    name: '**Армия Los-Santos**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LSa')}\`**`,
                    inline: true
                }, {
                    name: '**Армия San-Fierro**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'SFa')}\`**`,
                    inline: true
                }, {
                    name: '**Центральный банк**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'CB')}\`**`,
                    inline: true
                }, {
                    name: '**Правительство**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'GOV')}\`**`,
                    inline: true
                }, {
                    name: '**Автошкола**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'ASH')}\`**`,
                    inline: true
                }, {
                    name: '**Больница Los-Santos**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LSMC')}\`**`,
                    inline: true
                }, {
                    name: '**Больница San-Fierro**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'SFMC')}\`**`,
                    inline: true
                }, {
                    name: '**Больница Las-Venturas**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LVMC')}\`**`,
                    inline: true
                }, {
                    name: '**Радио Los-Santos**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LSFM')}\`**`,
                    inline: true
                }, {
                    name: '**Радио San-Fierro**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'SFFM')}\`**`,
                    inline: true
                }, {
                    name: '**Радио Las-Venturas**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LVFM')}\`**`,
                    inline: true
                }, {
                    name: '**Радио Las-Venturas**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'LVFM')}\`**`,
                    inline: true
                }, {
                    name: '**Тюрьма Строгого Режима**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'TCP')}\`**`,
                    inline: true
                }, {
                    name: '**Федеральное Бюро Расследований**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'FBI')}\`**`,
                    inline: true
                }, {
                    name: '**Страховая компания**',
                    value: `**Онлайн: \`${this.getOnlineFractionByTag(guild.id, 'INS')}\`**`,
                    inline: true
                }
            ])
        // Получаем все сообщения из канала и затем для нормальной работы перекидываем их в массив.
        const messages = []
        for (const [id, message] of (
            await onlineFractionChannel.messages.fetch()
        )) {
            messages.push(message)
        }
        const messageByBot = messages.find(message => message.author.id === this.bot.user.id)
        if (messageByBot) {
            // Если сообщение, то просто редактируем его
            await messageByBot.edit({
                embeds: [
                    messageEmbed
                        .setAuthor({
                            name: messageByBot.guild.name,
                            iconURL: messageByBot.guild.iconURL()
                        })
                ]
            })
        } else {
            // Если сообщения нет, то отправляем новое
            await onlineFractionChannel.send({
                embeds: [
                    messageEmbed
                        .setAuthor({
                            name: onlineFractionChannel.guild.name,
                            iconURL: onlineFractionChannel.guild.iconURL()
                        })
                ]
            })
        }
    }
}
