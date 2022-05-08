const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "account-info", // название команды
    descr:
        "Узнать некоторую информацию по аккаунту", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.some(r => ["Проверенный 🔐", "Jr.Discord Master"].includes(r.name))) return
        let user = message.guild.members.cache.get(message.mentions.users.first()?.id);
        if (user) {
            let userroles;
            await user.roles.cache.filter(role => {
                if (userroles == undefined) {
                    if (!role.name.includes("everyone")) userroles = `<@&${role.id}> `
                } else {
                    if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}> `
                }
            })
            let perms;
            if (user.permissions.has("ADMINISTRATOR") || user.permissions.has("MANAGE_ROLES")) {
                perms = "[!] Пользователь модератор [!]";
            } else {
                perms = "У пользователя нет админ прав."
            }
            if (userroles == undefined) {
                userroles = `отсутствуют.`
            }
            let date = user.user.createdAt;
            let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} `
            date = user.joinedAt
            let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} `
            message.reply({
                content: `**вот информация по поводу аккаунта <@${user.id}>**`, embeds: [new MessageEmbed()
                    .setTimestamp()
                    .addField(`Дата создания аккаунта и входа на сервер`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                    .addField(`Roles and Permissions`, `**Роли:** ${userroles}\n**PERMISSIONS:** \`${perms}\``)
                    .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.displayAvatarURL({
                        format: 'png',
                        size: 2048,
                        dynamic: true
                    }))
                ]
            })
            return //message.delete();
        } else {
            if (!args[1]) return
            let name = args.slice(1).join(" ");
            let foundmember = false;
            await message.guild.members.filter(f_member => {
                if (f_member.displayName.includes(name)) {
                    foundmember = f_member
                } else if (f_member.user.tag.includes(name)) {
                    foundmember = f_member
                }
            })
            if (foundmember) {
                let user = foundmember
                let userroles;
                await user.roles.filter(role => {
                    if (userroles == undefined) {
                        if (!role.name.includes("everyone")) userroles = `<@&${role.id}>`
                    } else {
                        if (!role.name.includes("everyone")) userroles = userroles + `, <@&${role.id}>`
                    }
                })
                let perms;
                if (user.permissions.has("ADMINISTRATOR") || user.permissions.has("MANAGE_ROLES")) {
                    perms = "[!] Пользователь модератор [!]";
                } else {
                    perms = "У пользователя нет админ прав."
                }
                if (userroles == undefined) {
                    userroles = `отсутствуют.`
                }
                let date = user.user.createdAt;
                let registed = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                date = user.joinedAt
                let joindate = `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`
                message.reply({
                    content: `**вот информация по поводу аккаунта <@${user.id}>**`, embeds: [new MessageEmbed()
                        .setTimestamp()
                        .addField(`Дата создания аккаунта и входа на сервер`, `**Аккаунт создан:** \`${registed}\`\n**Вошел к нам:** \`${joindate}\``)
                        .addField(`Roles and Permissions`, `**Роли:** ${userroles}\n**PERMISSIONS:** \`${perms}\``)
                        .setFooter(`Аккаунт пользователя: ${user.displayName}`, user.user.displayAvatarURL({
                            format: 'png',
                            size: 2048,
                            dynamic: true
                        }))
                    ]
                })
            }
        }
    },
}
;
