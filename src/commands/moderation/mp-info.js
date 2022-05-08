const {
    EmbedBuilder, Colors, ApplicationCommandOptionType, ChannelType
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");
const getModerInfo = require("../../components/getModerInfo");

module.exports = {
    name: "mp-info", // название команды
    descr: "Информация по МП для модерации", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    archive: true, // находится ли команда в архиве
    arguments: [], // аргументы
    perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args}) => {
        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Информация по МП`)
                    .setColor(Colors.Red)
                    .addFields(
                        {
                            name: `**Инструкция по использованию**`,
                            value: '**「1️⃣」 Создаётся канал для мероприятия, который не видят до начала**\n' +
                                '\**「2️⃣」 Для того, что бы запустить МП, нажмите 💥 в канале руководства мероприятием!**\n' +
                                '\**「3️⃣」 Внимательно читайте обозначения эмодзи и не нажимайте кучу раз!**\n' +
                                '\**「4️⃣」 Достаточно одного нажатия на эмодзи**\n' +
                                '\**「5️⃣」 По всем остальным вопросам пишите Romeo Gallo. [недоработки/баги/улучшения]**\n' +
                                '\**「6️⃣」 СОЗДАВАТЬ КАНАЛА КОМАНДОЙ /mp-create ДОСТУПНА ТОЛЬКО СОВЕТУ И JR.D**\n'
                        }
                    )
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },
}
;
