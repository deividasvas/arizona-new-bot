const convertMinutesToMs = require("../components/convertMinutesToMs");
const {getGuildChannelsId, getGuildCategoriesId} = require("../configs/settings");
const {EmbedBuilder, Colors} = require("discord.js");
module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы автоматически удалять тикеты через какое-то время.
    */
    name: "autoDeleteTickets", // имя модуля
    autoRun: true,
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    async run({bot}) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        // Каждый час очищаем корзину с тикетами.

        // Очищаем первый раз при запуске бота.
        for (const [id, guild] of bot.guilds.cache) {
            this.clear(bot, guild);
        }

        setInterval(() => {
            for (const [id, guild] of bot.guilds.cache) {
                this.clear(bot, guild);
            }
        }, convertMinutesToMs(60));
    },
    async clear(bot, guild) {
        const categoriesId = getGuildCategoriesId(guild.id);
        const channelsId = getGuildChannelsId(guild.id);
        // Все тикеты которые находятся в корзине.
        const logTicketsChannel = guild.channels.cache.get(channelsId.ticketsLog);
        const tickets = guild.channels.cache.filter(channel => channel.parentId === categoriesId.basketTickets);
        // Удаляем тикеты которые находятся в корзине.
        for (const [id, channel] of tickets) {
            await channel.delete();
            await logTicketsChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('📌 | Очистка тикета!')
                        .setDescription(`**Тикет \`${channel.name}\` был удален автоматической системой!**`)
                        .setColor(Colors.Blue)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL()
                        })
                        .setFooter({
                            text: 'Surprise Bot',
                            iconURL: bot.user.displayAvatarURL()
                        })
                ]
            })
        }
    }
};