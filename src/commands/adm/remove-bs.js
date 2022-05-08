const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "remove-bs", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (message.channel.id != '603606099081428995' || message.channel.id != '649270582717841418') return
        if (!message.member.roles.cache.some(r => ["Технический администратор"].includes(r.name)) && !message.member.permissions.has("ADMINISTRATOR")) return
        if (!args[1]) return message.channel.send({content: `**\`Используйте: ${prefix}remove_bs [iD]\`**`});
        setTimeout(() => messages.delete(), 12000);
        var sql = `SELECT * FROM surprise_whitelist`;
        bot.connection.query(sql, function (err, result) {
            if (err) throw err;
            for (var i in result) {
                if (result[i].id == args[1]) {
                    var sql = `DELETE FROM surprise_whitelist WHERE id = ${args[1]}`;
                    bot.connection.query(sql, function (err, result) {
                        if (err) throw err;
                    });
                    message.channel.send({content: `**\`Индетификатор ${args[1]} убран с белого списка\`**`});
                    setTimeout(() => messages.delete(), 12000);
                }
            }
        });
    },
};
