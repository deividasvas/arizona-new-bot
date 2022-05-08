const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "user-search", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.some(r => ["Проверенный 🔐"].includes(r.name))) return
        if (!args[0]) return
        let name = args.slice(0).join(" ");
        let userfinders = false;
        let foundedusers_nick;
        let numberff_nick = 0;
        let foundedusers_tag;
        let numberff_tag = 0;
        message.guild.members.cache.filter(userff => {
            if (userff.displayName.toLowerCase().includes(name.toLowerCase())) {
                if (foundedusers_nick == null) {
                    foundedusers_nick = `${numberff_nick + 1}) <@${userff.id}>`
                } else {
                    foundedusers_nick = foundedusers_nick + `\n${numberff_nick + 1}) <@${userff.id}>`
                }
                numberff_nick++
                if (numberff_nick == 15 || numberff_tag == 15) {
                    if (foundedusers_tag == null) foundedusers_tag = `НЕ НАЙДЕНЫ`;
                    if (foundedusers_nick == null) foundedusers_nick = `НЕ НАЙДЕНЫ`;
                    message.reply({
                        content: '\`по вашему запросу найдена следующая информация:\`', embeds: [new MessageEmbed()
                            .setColor(0xbb00ff)
                            .addField(`BY NICKNAME`, foundedusers_nick, true)
                            .addField(`BY DISCORD TAG`, foundedusers_tag, true)
                        ]
                    });
                    numberff_nick = 0;
                    numberff_tag = 0;
                    foundedusers_tag = null;
                    foundedusers_nick = null;
                }
                if (!userfinders) userfinders = true;
            } else if (userff.user.tag.toLowerCase().includes(name.toLowerCase())) {
                if (foundedusers_tag == null) {
                    foundedusers_tag = `${numberff_tag + 1}) <@${userff.id}>`
                } else {
                    foundedusers_tag = foundedusers_tag + `\n${numberff_tag + 1}) <@${userff.id}>`
                }
                numberff_tag++
                if (numberff_nick == 15 || numberff_tag == 15) {
                    if (foundedusers_tag == null) foundedusers_tag = `НЕ НАЙДЕНЫ`;
                    if (foundedusers_nick == null) foundedusers_nick = `НЕ НАЙДЕНЫ`;
                    message.reply({
                        content: '\`по вашему запросу найдена следующая информация:\`', embeds: [new MessageEmbed()
                            .setColor(0xbb00ff)
                            .addField(`BY NICKNAME`, foundedusers_nick, true)
                            .addField(`BY DISCORD TAG`, foundedusers_tag, true)
                        ]
                    });
                    numberff_nick = 0;
                    numberff_tag = 0;
                    foundedusers_tag = null;
                    foundedusers_nick = null;
                }
                if (!userfinders) userfinders = true;
            }
        })
        if (!userfinders) {
            const messages = await message.reply({content: 'Я никого не нашёл!'});
            setTimeout(() => messages.delete(), 10000);
            return
        }
        if (numberff_nick != 0 || numberff_tag != 0) {
            if (foundedusers_tag == null) foundedusers_tag = `НЕ НАЙДЕНЫ`;
            if (foundedusers_nick == null) foundedusers_nick = `НЕ НАЙДЕНЫ`;
            message.reply({
                content: '\`по вашему запросу найдена следующая информация:\`', embeds: [new MessageEmbed()
                    .setColor(0xbb00ff)
                    .addField(`BY NICKNAME`, foundedusers_nick, true)
                    .addField(`BY DISCORD TAG`, foundedusers_tag, true)
                ]
            });
        }
    },
};
