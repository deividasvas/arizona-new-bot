const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "skin", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (!message.member.roles.cache.some(r => ["Администратор 4 ур.", "Администратор 3 ур.", "Мл. Администратор [1-2 ур]"].includes(r.name)) && !message.member.permissions.has('ADMINISTRATOR')) return message.delete();
        if (!args[0]) return message.reply({
            embeds: [new MessageEmbed()
                .setColor(`#FF9046`)
                .setTitle(`**Ошибка команды**`)
                .setDescription(`**Укажите номер скина!\nПример: \`/skin [id skin]\`**`)
                .setFooter('©RoboHamster Surprise', bot.user.displayAvatarURL({
                    format: 'png',
                    size: 2048,
                    dynamic: true
                }))
            ]
        }).then(msg => setTimeout(() => msg.delete(), 12000))
        if (isNaN(args[0])) return message.reply({
            embeds: [new MessageEmbed()
                .setColor(`#FF9046`)
                .setTitle(`**Ошибка команды**`)
                .setDescription(`**Укажите номер скина, а не букву!**`)
                .setFooter('©RoboHamster Surprise', bot.user.displayAvatarURL({
                    format: 'png',
                    size: 2048,
                    dynamic: true
                }))
            ]
        }).then(msg => setTimeout(() => msg.delete(), 12000))
        if (args[0] < 400 || args[0] > 381) return message.reply({
            embeds: [new MessageEmbed()
                .setColor(`#FF9046`)
                .setTitle(`**Ошибка команды**`)
                .setDescription(`**Такого скина нет!**`)
                .setFooter('©RoboHamster Surprise', bot.user.displayAvatarURL({
                    format: 'png',
                    size: 2048,
                    dynamic: true
                }))
            ]
        }).then(msg => setTimeout(() => msg.delete(), 12000))
        if (args[0]) {
            let embed = new MessageEmbed()
                .setColor(`#FF9046`)
                .setTitle(`**Вывод скина номер ${args[0]}**`)
                .setFooter('©RoboHamster Surprise', bot.user.displayAvatarURL({
                    format: 'png',
                    size: 2048,
                    dynamic: true
                }))
                .setImage(`https://items.shinoa.tech/images/skins/skin_${args[0]}.jpg`)
            message.channel.send({
                embeds: [embed],
                file: [`https://items.shinoa.tech/images/skins/skin_${args[0]}.jpg`]
            }).then(msg => setTimeout(() => msg.delete(), 60000))
        }
    },
};
