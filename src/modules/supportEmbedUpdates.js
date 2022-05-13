const {channelsId} = require("../configs/settings");
const {EmbedBuilder, Colors, ButtonStyle, ButtonBuilder, ActionRowBuilder} = require("discord.js");
const LogDataBase = require('../models/LogDataBase');
const convertMinutesToMs = require("../components/convertMinutesToMs");
module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы загружать данные с API мятной плантации.
      По большей части, в эти данные входит онлайн фракции и информация о них.
    */
    name: "supportEmbedUpdates", // имя модуля
    acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
    async run({bot}) {
        // Команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        this.bot = bot;
        await this.update();

        setInterval(async () => {
            await this.update();
        }, convertMinutesToMs(5));
    }, // Функция обновления информации о фракции
    async update() {
        const { bot } = this;
        for (const [id, guild] of bot.guilds.cache) {
            const supportChannel = guild.channels.cache.get(channelsId[id].support);

            const messagesOfBot = [];

            for (const [id, message] of Array.from((await supportChannel.messages.fetch()).filter(message => message.author.id === bot.user.id)).reverse()) {
                messagesOfBot.push(message);
            }
            const answers = (await LogDataBase.find({ action: `SupportClose`, })).length;

            const embed = new EmbedBuilder()
                .setTitle("***📨 Техническая поддержка!***")
                .setDescription(`**Приветствуем! Вы попали в канал поддержки сервера \`${guild.name}\`**\n**Тут вы можете подать жалобу на модератора/игрока и спросить любой вопрос по нашему Discord'y.**\n\`\`\`fix\nSupport Rules!\n\`\`\`\`\`\`asciidoc\n9.1 :: Запрещается оскорбление пользователей/модераторов. - P3\n9.2 :: Запрещено рекламировать сторонние ресурсы (Искл.Arizona RP). - P6\n9.3 :: Запрещается явное или скрытое упоминание/оскорбление родных. - P6\n9.4 :: Запрещено оффтопить (вопросы не связанные с дискорд сервером и прочее). - блокировка саппорта - P9\n9.5 :: Запрещено писать в Support бредовые/неадекватные вопросы. - P9\n\`\`\`\n**Чтобы создать тикет, нажмите на кнопку 📨\nЗа все время мы обработали: ${answers} вопроса!**`)
                .setImage('https://i.pinimg.com/originals/ed/6b/ff/ed6bff8acacfe3129c50523c36c54c37.gif')
                .setColor(Colors.DarkGreen)

            const row = new ActionRowBuilder()
                .addComponents(
                    [
                        new ButtonBuilder()
                            .setCustomId('create_ticket')
                            .setEmoji({
                                name: `📨`,
                            })
                            .setStyle(ButtonStyle.Primary)
                    ]
                );

            if (messagesOfBot[0]) {
                messagesOfBot[0].edit({
                    embeds: [embed],
                    components: [row]
                })
            } else {
                supportChannel.send({
                    embeds: [embed],
                    components: [row]
                })
            }
        }
    }
};
