const {EmbedBuilder, Colors} = require("discord.js");
const axios = require("axios");
const getMinutesInMs = require("../components/getMinutesInMs");
const {channelsId} = require("../configs/settings");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы загружать данные с API мятной плантации.
      По большей части, в эти данные входит онлайн фракции и информация о них.
    */
    name: "fractionsInfo", // имя модуля
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    tags: {
        1: "LSPD",
        2: "RCSD",
        3: "FBI",
        4: "SFPD",
        5: "LSMC",
        6: "GOV",
        7: "TCP", // английские буквы
        8: "SFMC",
        9: "ASH",
        10: "LSFM",
        20: "LSa",
        21: "CB",
        22: "LVMC",
        23: "LVMPD",
        24: "LVFM",
        26: "SFFM",
        27: "SFa",
        29: "INS",
    }, // короткие теги организации
    async run({bot}) {
        // Команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        this.bot = bot; // устанавливаем бота в общий объект чтоб можно было удобно взаимодействовать

        // Каждые пять минут обновляем информацию
        await this.updateAllFractionsInfo(); // инициализация данные информации об организациях
        await this.updateOnlineEmbed() // инициализируем данные в эмбеде онлайн-фракции

        setInterval(async () => {
            // Обновляем данные
            await this.updateAllFractionsInfo();

            // Обновляем эмбед
            await this.updateOnlineEmbed();
        }, getMinutesInMs(5));
        console.log(`[📌 | Fractions]: Информация о фракциях была успешно загружена!`)
    }, // Функция обновления информации о фракции
    async updateFractionInfo(fractionId) {
        const url = `https://api.mint-plantation.ru/members.php?p=0&s=10&o=${fractionId}`;
        const request = await axios.get(url, {
            headers: {
                Authorization: `y3HJ6bGYK9TUCMvkHVmA`
            }
        }); // делаем запрос к API мятной плантации(одна из неофициальных API Arizona Games)

        // пытаемся найти уже существующий объект с организацией, если его нет, то создаём новый
        const {data: {row: fractionMembers}} = request;

        // Объект с возможно существующей информацией о фракции
        let fraction = this.bot.fractions.data.find(fraction => fraction.id === fractionId);
        if (!fraction) {
            // если объекта нет, то вставляем новый.
            this.bot.fractions.data.push({
                id: Number(fractionId),
                members: fractionMembers,
                tag: this.tags[fractionId],
                online: fractionMembers.filter(member => member.isOnline).length
            });
        } else {
            // Если есть, то просто редактируем. (Изменения благодаря тому что это метод find автоматически введутся).
            fraction = {
                id: fractionId, members: fractionMembers, tag: this.tags[fractionId],
            }
        }
    }, // Функция обновления информации о ВСЕХ организациях.
    async updateAllFractionsInfo() {
        // Айдишники всех организации.
        const fractionsId = Object.keys(this.tags);

        for (const fractionId of fractionsId) {
            await this.updateFractionInfo(fractionId);
        }
        this.bot.fractions.init = true;
        this.bot.fractions.dateOldInit = new Date();
    }, // Функция для получения онлайна фракции при помощи тега организации.
    getOnlineFractionByTag(tag) {
        return this.bot.fractions.data.find(fraction => fraction.tag.toLowerCase() === tag.toLowerCase())?.online;
    }, // Функция обновления эмбеда в канале онлайн-фракции.
    async updateOnlineEmbed() {
        // Получаем все сообщения в канале
        for (const [id, guild] of this.bot.guilds.cache) {
            const onlineFractionChannel = this.bot.channels.cache.get(channelsId[id].onlineFraction)
            const messageEmbed = new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Онлайн фракции`)
                .setTimestamp()
                .setColor(Colors.DarkGreen)
                .setFooter({
                    text: `Robo Hamster`, iconURL: this.bot.user.displayAvatarURL(),
                })
                .addFields([{
                    name: "**Полиция Los-Santos**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LSPD')}\`**`,
                    inline: true,
                }, {
                    name: "**Полиция San-Fierro**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('SFPD')}\`**`,
                    inline: true,
                }, {
                    name: "**Полиция Red-Country**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('SFPD')}\`**`,
                    inline: true,
                }, {
                    name: "**Полиция Las-Venturas**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LVMPD')}\`**`,
                    inline: true,
                }, {
                    name: "**Армия Los-Santos**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LSa')}\`**`,
                    inline: true,
                }, {
                    name: "**Армия San-Fierro**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('SFa')}\`**`,
                    inline: true,
                }, {
                    name: "**Центральный банк**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('CB')}\`**`,
                    inline: true,
                }, {
                    name: "**Правительство**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('GOV')}\`**`,
                    inline: true,
                }, {
                    name: "**Автошкола**", value: `**Онлайн: \`${this.getOnlineFractionByTag('ASH')}\`**`, inline: true,
                }, {
                    name: "**Больница Los-Santos**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LSMC')}\`**`,
                    inline: true,
                }, {
                    name: "**Больница San-Fierro**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('SFMC')}\`**`,
                    inline: true,
                }, {
                    name: "**Больница Las-Venturas**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LVMC')}\`**`,
                    inline: true,
                }, {
                    name: "**Радио Los-Santos**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LSFM')}\`**`,
                    inline: true,
                }, {
                    name: "**Радио San-Fierro**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('SFFM')}\`**`,
                    inline: true,
                }, {
                    name: "**Радио Las-Venturas**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LVFM')}\`**`,
                    inline: true,
                }, {
                    name: "**Радио Las-Venturas**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('LVFM')}\`**`,
                    inline: true,
                }, {
                    name: "**Тюрьма Строгого Режима**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('TCP')}\`**`,
                    inline: true,
                }, {
                    name: "**Федеральное Бюро Расследований**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('FBI')}\`**`,
                    inline: true,
                }, {
                    name: "**Страховая компания**",
                    value: `**Онлайн: \`${this.getOnlineFractionByTag('INS')}\`**`,
                    inline: true,
                }])
            // Получаем все сообщения из канала и затем для нормальной работы перекидываем их в массив.
            const messages = [];
            for (const [id, message] of (await onlineFractionChannel.messages.fetch())) {
                messages.push(message);
            }
            const messageByBot = messages.find(message => message.author.id === this.bot.user.id);
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
                });
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
};
