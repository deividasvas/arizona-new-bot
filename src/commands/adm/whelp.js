const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "whelp", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async () => {
        if (message.channel.id != '603606099081428995' || message.channel.id != '649270582717841418') return
        message.channel.send({
            embeds: [{
                color: "RANDOM",
                title: `Документация по работе с белым списком(песок)`,
                timestamp: new Date(),
                fields: [{
                    name: otv,
                    value: `\`/check [Ник]\` - **Проверить находиться ли игрок в списке**`
                },
                    {
                        name: otv,
                        value: `\`/add_bs [Ник-1] [Ник-2] [Ник-3]\` - **Добавить нового игрока в список**`
                    },
                    {
                        name: otv,
                        value: `\`/edit_bs [ID] [Ник-1]  [Ник-2] [Ник-3]\` - **Отредактировать список ников конкретного ID**`
                    },
                    {
                        name: otv,
                        value: `\`/remove_bs ID\` - **Убрать пользователя с списка**`
                    },
                    {
                        name: otv,
                        value: `\`/whelp\` - **Документация по работе с белым списком(песок)**`
                    }],
                footer: {
                    text: `Запросил: ${message.member.displayName}`,
                    icon_url: message.author.displayAvatarURL({format: 'png', size: 2048, dynamic: true})
                }
            }]
        }).then(msg => setTimeout(() => msg.delete(), 10000));
    },
}
;
