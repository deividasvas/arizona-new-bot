const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "profs-edit", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: (rolesId) => {
        return getAllRolesIdAdmins(rolesId);
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (!message.member.roles.cache.some(r => ["Главная администрация", "Куратор"].includes(r.name)) && !bot.developers.some(dev => dev == message.author.id)) return message.delete()
        const users = bot.checkUsers(args[0])
        if (!users) {
            const messages = await message.reply({content: '**\`[ERROR]\` Вы не указали пользователя!**'});
            setTimeout(() => messages.delete(), 10000);
            return
        }
        if (users == 'указал буквы') {
            const messages = await message.reply({content: '**\`[ERROR]\` Вы указали буквы при упоминание пользователя!**'});
            setTimeout(() => messages.delete(), 10000);
            return
        } else if (users == 'не удалось найти участника!') {
            const messages = await message.reply({content: '**\`[ERROR]\` Не удалось найти участника!**'});
            setTimeout(() => messages.delete(), 10000);
            return
        }
        const fUsers = await bot.users.fetch(users).catch(() => {
            return;
        })
        if (!fUsers) {
            const messages = await message.reply({content: '**\`[ERROR]\` Данного пользователя не существует!**'});
            setTimeout(() => messages.delete(), 10000);
            return
        }
        if (fUsers.bot) {
            const messages = await message.reply({content: '**\`[ERROR]\` Данный пользователь является ботом!!**'});
            setTimeout(() => messages.delete(), 10000);
            return
        }
        var fuser = message.guild.members.cache.get(fUsers.id); // Получаем пользователя

        if (!fuser) {
            const messages = await message.reply({content: '**\`[ERROR]\` Данный пользователь не состоит в Discord сервере**'});
            setTimeout(() => messages.delete(), 10000);
            return
        }

        var action = args[1] // действие
        if (!action) {
            const messages = await message.reply({content: '**\`[ERROR]\`Укажите действие.\n\`add\` - Добавить ачивку администратору\n\`edit\` - Редактировать ачивку администратору\n\`del\` - Удалить ачивку администратору\n\`znak\` - Установить знак кластности администратору.**'});
            setTimeout(() => messages.delete(), 10000);
            return
        } else if (action.toLowerCase() == "add") {
            var achive_desc = args.slice(2).join(" "); // Описание атчивки
            if (achive_desc.includes(";")) {
                const messages = await message.reply({content: '**Уберите `;` с названия ачивки**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }
            if (!achive_desc) {
                const messages = await message.reply({content: '**\`[ERROR]\` Используйте: \`/profs-edit [user] [add] [Ачивка]\`**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }

            bot.connection.query(`SELECT * FROM \`surprise_admins\` WHERE discord_id='${fuser.id}'`, function (err, result) {


                // Если нету в бд, тогда заносим
                if (result.length == 0) {
                    var query = `INSERT INTO \`surprise_admins\` (\`discord_id\`, \`achiev\`) VALUES ('${fuser.id}', '${achive_desc}')`;
                    bot.connection.query(query, function (err, result) {
                        if (err) console.log(err);
                    });
                    command(bot, message, args, developers, support_settings)
                } else
                    console.log(result[0])
                var achievments = result[0].achiev
                achievments += achive_desc + ";" // Добавляем отчивку

                // Обновляем в бд
                bot.connection.query(`UPDATE \`surprise_admins\` SET achiev = '${achievments}' WHERE discord_id='${fuser.id}'`)
                let embed = new MessageEmbed()
                    .setColor("#77a6ff")
                    .setAuthor(`Аrizona 🌴 Surprise`, `${fuser.guild.iconURL()}`)
                    .setTitle(`Профиль: \`${fuser.displayName}\``)
                    .setDescription(`**Изменение ачивки № : \`${number_achive}\`**`)
                    .setFooter(`Администрация Arizona RP Surprise`)
                message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 10000));

            })
        } else if (action.toLowerCase() == "znak") {
            var new_znak = args[2]
            if (parseInt(new_znak) == undefined || isNaN(parseInt(new_znak))) {
                const messages = await message.reply({content: '**\`[ERROR]\`Укажите целое число от 1 до 15.**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }
            if (new_znak < 1 || new_znak > 15) {
                const messages = await message.reply({content: '**\`[ERROR]\`Укажите целое число от 1 до 15.**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }

            bot.connection.query(`SELECT * FROM \`surprise_admins\` WHERE discord_id='${fuser.id}'`, function (err, result) {

                // Если нету в бд, тогда заносим
                if (result.length == 0) {
                    var query = `INSERT INTO \`surprise_admins\` (\`discord_id\`, \`znak\`, \`achiev\`) VALUES ('${fuser.id}', '${new_znak}', ';')`;
                    let embed = new MessageEmbed()
                        .setColor("#77a6ff")
                        .setAuthor(`Аrizona 🌴 Surprise`, `${fuser.guild.iconURL()}`)
                        .setTitle(`Профиль: \`${fuser.displayName}\``)
                        .setDescription(`**Изменение знака кластности: \`${new_znak}\`**`)
                        .setFooter(`Администрация Arizona RP Surprise`)
                    message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 10000));
                    bot.connection.query(query, function (err, result) {
                        if (err) console.log(err);
                    });
                    command(bot, message, args, developers, support_settings)
                } else {

                    // Обновляем в бд
                    bot.connection.query(`UPDATE \`surprise_admins\` SET znak = '${new_znak}' WHERE discord_id='${fuser.id}'`)
                    let embed = new MessageEmbed()
                        .setColor("#77a6ff")
                        .setAuthor(`Аrizona 🌴 Surprise`, `${fuser.guild.iconURL()}`)
                        .setTitle(`Профиль: \`${fuser.displayName}\``)
                        .setDescription(`**Изменение знака кластности: \`${new_znak}\`**`)
                        .setFooter(`Администрация Arizona RP Surprise`)
                    message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 10000));
                }
            })
        } else if (action.toLowerCase() == "edit") {

            let fuser = message.guild.members.cache.get(message.mentions.users.first()?.id); // Получаем пользователя
            var number_achive = args[2]; // Номер атчивки
            var achive_desc = args.slice(3).join(" "); // Новое описание атчивки
            if (!number_achive) {
                const messages = await message.reply({content: '**\`[ERROR]\` Используйте: \`/profs-edit [user] [edit] [Номер Ачивки администратора] [Новая ачивка]\`**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }
            if (!achive_desc) {
                const messages = await message.reply({content: '**\`[ERROR]\` Используйте: \`/profs-edit [user] [edit] [Номер Ачивки администратора] [Новая ачивка]\`**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }

            if (achive_desc.includes(";")) {
                const messages = await message.reply({content: '**Уберите `;` с названия ачивки**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }

            bot.connection.query(`SELECT * FROM \`surprise_admins\` WHERE discord_id='${fuser.id}'`, function (err, result) {

                // Если нету в бд, тогда заносим
                if (result.length == 0) {
                    var query = `INSERT INTO \`surprise_admins\` (\`discord_id\`) VALUES ('${fuser.id}')`;
                    bot.connection.query(query, function (err, result) {
                        if (err) console.log(err);
                    });
                    command(bot, message, args, developers, support_settings)
                }

                // Разделяем строку с атчивками в массив по символу
                var achievments = result[0].achiev.split(";").filter(e => !isEmpty(e));

                // Если нету такой ошибки, тогда выходим
                if (achievments[number_achive - 1] == undefined) {
                    const messages = message.reply({content: `\`[ERROR]\` у данного администратора нету атчивки **№${number_achive}**`});
                    setTimeout(() => messages.delete(), 10000);
                    return
                }
                // Изменяем атчивку в массиве и потом обратно превращаем в строку
                achievments[number_achive - 1] = achive_desc
                var updated_achievments = achievments.join(";")

                // Обновляем в бд
                bot.connection.query(`UPDATE \`surprise_admins\` SET achiev = '${updated_achievments}' WHERE discord_id='${fuser.id}'`)
                let embed = new MessageEmbed()
                    .setColor("#77a6ff")
                    .setAuthor(`Аrizona 🌴 Surprise`, `${fuser.guild.iconURL()}`)
                    .setTitle(`Профиль: \`${fuser.displayName}\``)
                    .setDescription(`**Изменение ачивки № : \`${number_achive}\`**`)
                    .setFooter(`Администрация Arizona RP Surprise`)
                message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 10000));
            })
        } else if (action.toLowerCase() == "del") {

            let fuser = message.guild.members.cache.get(message.mentions.users.first()?.id); // Получаем пользователя
            var number_achive = args[2]; // Номер атчивки
            var achive_desc = args.slice(2).join(" "); // Новое описание атчивки
            if (!achive_desc) {
                const messages = await message.reply({content: '**\`[ERROR]\` Используйте: \`/profs-edit [user] [edit] [Номер Ачивки администратора] [Новая ачивка]\`**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }

            if (achive_desc.includes(";")) {
                const messages = await message.reply({content: '**Уберите `;` с названия ачивки**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }

            bot.connection.query(`SELECT * FROM \`surprise_admins\` WHERE discord_id='${fuser.id}'`, function (err, result) {

                // Если нету в бд, тогда заносим
                if (result.length == 0) {
                    var query = `INSERT INTO \`surprise_admins\` (\`discord_id\`) VALUES ('${fuser.id}')`;
                    bot.connection.query(query, function (err, result) {
                        if (err) console.log(err);
                    });
                    command(bot, message, args, developers, support_settings)
                }

                var achievments = result[0].achiev.split(";") // Разделяем строку с атчивками в массив по символу
                var achive_remove = achievments[number_achive - 1] // Находим атчивку в массиве
                var updated_achivement = achievments.filter(e => e !== achive_remove) // Убераем атчивку с масиива
                var achievments_str = updated_achivement.join(";") // Возвращаем массив обратно в строку

                // Обновляем в бд
                bot.connection.query(`UPDATE \`surprise_admins\` SET achiev = '${achievments_str}' WHERE discord_id='${fuser.id}'`)
                let embed = new MessageEmbed()
                    .setColor("#77a6ff")
                    .setAuthor(`Аrizona 🌴 Surprise`, `${fuser.guild.iconURL()}`)
                    .setTitle(`Профиль: \`${fuser.displayName}\``)
                    .setDescription(`**Удаление ачивки.**`)
                    .setFooter(`Администрация Arizona RP Surprise`)
                message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 10000));
            })
        } else {
            return message.reply({content: '**\`[ERROR]\`Некорректная команда.\`**'});
        }
    },
};
