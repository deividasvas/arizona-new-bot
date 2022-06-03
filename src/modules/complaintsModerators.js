const {EmbedBuilder, Colors} = require("discord.js");
const {getGuildRolesId, getGuildChannelsId} = require("../configs/settings");
const axios = require("axios");
const {load} = require("cheerio");
const {getReportsList} = require("../components/getReportsList");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы передавать при появлении жалобы на модерацию.
    */
    name: "complaintsModerators", // имя модуля
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    run: async ({bot}) => {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        return;
        const channel = await bot.channels.cache.get('973584583163514880')
        const complaitInfo = await getReportsList();
        complaitInfo.map(async el => {
            channel.send({
                embeds: [new EmbedBuilder()
                    .setTitle(`[${el.label}] - ${el.title}`)
                    .addFields([
                            {
                                name: `Статус:`,
                                value: `${el.label}`,
                                inline: false
                            },
                            {
                                name: `Заголовок:`,
                                value: `${el.title}`,
                                inline: false
                            },
                        ]
                    )
                    .setColor(Colors.Blue)
                    .setTimestamp()
                ]
            })
        })
    },
};