const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "check", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: (rolesId) => {
        return getAllRolesIdAdmins(rolesId);
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (!args[1]) return message.channel.send({content: `**\`Используйте: ${prefix}check [Ник]\`**`}).then(msg => setTimeout(() => msg.delete(), 10000));
        var list_nickname = args.slice(1).join(" ").split(" ");
        var sql = `SELECT * FROM surprise_whitelist`;
        bot.connection.query(sql, function (err, result) {
            if (err) throw err;
            var not_found = false;
            for (var i in result) {
                var list_bd = result[i].nickname.split(" ");
                for (var j in list_bd) {
                    for (var n in list_nickname) {
                        if (list_bd[j] == list_nickname[n]) {
                            not_found = true
                            message.channel.send({
                                embeds: [{
                                    color: "RANDOM",
                                    title: `Белый список`,
                                    timestamp: new Date(),
                                    description: `\`Данный пользователь уже находиться в белом списке.\``,
                                    fields: [{
                                        name: `ID ${result[i].id}`,
                                        value: list_bd
                                    }],
                                    footer: {
                                        text: `Запросил: ${message.member.displayName}`,
                                        icon_url: message.author.displayAvatarURL({
                                            format: 'png',
                                            size: 2048,
                                            dynamic: true
                                        })
                                    }
                                }]
                            }).then(msg => setTimeout(() => msg.delete(), 10000));
                        }
                    }
                }
            }
            if (!not_found) message.channel.send({content: "**\`Даного пользователя нету в белом списке\`**"}).then(msg => setTimeout(() => msg.delete(), 10000));
        })
    },
}
;
