const {
    EmbedBuilder, Colors, ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const {rolesId, channelsId} = require("../../configs/settings");

module.exports = {
    name: "sforum", // название команды
    descr: "Сообщить пользователям про существование форума модерации", // описание команды
    arguments: [{
        name: "пользователь",
        description: "Модератор у которого Вы хотите статистику наказаний по выговорам/предупреждениям",
        type: ApplicationCommandOptionType.User,
        required: false,
    }], // аргументы
    perms: () => getAllRolesIdModers(), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args}) => {
        const welcome = guild.channels.cache.get(channelsId.welcome); // получаем канал куда будет отправлять эмбед
        welcome.send({
            embeds: [new EmbedBuilder()
                .setTitle("📌 | Просим минуточку внимания!")
                .setColor(Colors.DarkRed)
                .setTimestamp()
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                })
                .addFields({
                    name: '**Ссылки на разделы:**',
                    value: ' **Раздел подачи жалоб [На пользователей Discord сервера](https://forum.robo-hamster.ru/forums/50/)**\n' + ' **Раздел подачи жалоб [На модерацию](https://forum.robo-hamster.ru/forums/49/)**\n',
                    inline: false
                }, {
                    name: '**Обратите внимание при написании жалобы!**',
                    value: '**「1️⃣」Соблюдайте терпение и адекватность при написании жалобы \n' + '「2️⃣」Не нарушайте правила форума.\n' + '「3️⃣」Не оскорбляйте модераторов. \n' + '**',
                    inline: false
                }),],
        });
        interaction.reply({
            ephemeral: true, embeds: [new EmbedBuilder()
                .setTitle("📌 | Просим минуточку внимания!")
                .setColor(0xfab86e)
                .setTimestamp()
                .setAuthor({
                    name: guild.name, iconURL: guild.iconURL(),
                })
                .setDescription(`**Вы успешно про рекламировали форум модерации в канале <#${channelsId.welcome}>**`)
                .setFooter({
                    text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                })],
        });
    },
};
