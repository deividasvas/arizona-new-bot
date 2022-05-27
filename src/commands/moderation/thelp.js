const {
    EmbedBuilder, Colors,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");

module.exports = {
    name: "thelp", // название команды
    descr: "Помощь по основным командам модерации", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, guild}) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Команды!")
                    .setColor(Colors.Blue)
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
