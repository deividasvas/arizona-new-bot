const {
    EmbedBuilder, Colors, ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");
const {rolesId, channelsId} = require("../../configs/settings");

module.exports = {
    name: "thelp", // название команды
    descr: "Помощь по основным командам модерации", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    perms: () => getAllRolesIdModers(), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, guild}) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Команды!")
                    .setColor(Colors.DarkGreen)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**\`/set-stat\` - изменить статистику\n\`/myinfo\` - посмотреть свою статистику\n\`/myinfo [Модератор]\` - посмотреть чужую статистику**`
                    )
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },
};
