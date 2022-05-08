const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "add-bs", // название команды
    descr:
        "Добавить аккаунт в белый список", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (message.channel.id != '603606099081428995' || message.channel.id != '649270582717841418') return
        if (!message.member.roles.cache.some(r => ["Технический администратор"].includes(r.name)) && !message.member.permissions.has("ADMINISTRATOR")) return
        if (!args[1]) return message.channel.send({content: `**\`Используйте: ${prefix}add_bs [Никнейм-1] [Никнейм-2] [Никнейм-3]\`**`});
        setTimeout(() => messages.delete(), 12000);
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
                            message.channel.send({content: "**\`Данный пользователь уже есть в белом списке\`**"});
                            setTimeout(() => messages.delete(), 12000);
                        }
                    }
                }
            }
            if (!not_found) {
                var player = args.slice(1).join(" ")
                var sql = `INSERT INTO surprise_whitelist (nickname) VALUES ('${player}')`;
                bot.connection.query(sql, function (err, result) {
                    if (err) throw err;
                    message.channel.send({content: "**\`Пользователь добавлен в белый список\`**"});
                    setTimeout(() => messages.delete(), 12000);
                });
            }
        })
    },
}
;
