const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");

module.exports = {
    name: "profs", // название команды
    descr:
        "-", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [], // аргументы
    archive: true, // команда находится в архиве
    perms: () => {
        return getAllRolesIdAdmins();
    }, // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, args, author, guild}) => {
        if (!message.member.permissions.has("ADMINISTRATOR") && !message.member.roles.cache.some(r => ["Мл. Администратор [1-2 ур]", "Администратор 3 ур.", "Администратор 4 ур."].includes(r.name)) && !bot.developers.some(dev => dev == message.author.id)) return message.delete()

        // var classes_signs_emojies = { // Сюда названия эмоджи прикрепи
        //     1: "<:1_:762867640129159189>",
        //     2: "<:2_:762867640090886165>",
        //     3: "<:3_:762867640518967346>",
        //     4: "<:4_:762867640774688788>",
        //     5: "<:5_:762867640775475230>",
        //     6: "<:6_:762867640694865951>",
        //     7: "<:7_:762867643598241792>",
        //     8: "<:8_:762867643634941973>",
        //     9: "<:9_:762867643236483092>",
        //     10: "<:10:762867642359873537>",
        //     11: "<:11:762867643229143040>",
        //     12: "<:12:762867643513438228>",
        //     13: "<:13:762867643928805376>",
        //     14: "<:14:762867644255698944>",
        //     15: "<:15:762867644201304064>",
        // }
        var posts = { // Тут напиши должности
            "Главная администрация": "Главная администрация сервера",
            "Спец.Администратор": "Красная администрация",
            "Куратор": "Куратор сервера",
            "Зам.Куратора Тех.Раздела": "Зам. Куратор Технического раздела",
            "ГС ГОС": "Главный следящий за государственными организациями",
            "Руководство Нелегалов": "Главный следящий за Нелегалами",
            "ЗГС ГОС": "Зам.Главного следящего за гос. фракциями",
            "Руководство Пра-ва": "Руководитель за Правительством",
            "Руководство МЮ": "Руководитель за МЮ",
            "Руководство МО": "Руководитель за МО",
            "Руководство МЗ": "Руководитель за МЗ",
            "Руководство СМИ": "Руководитель за СМИ",
            "Руководство Гетто": "Руководитель за Гетто",
            "Руководство Мафий": "Руководитель за Мафиями",
            "ГС Неоф. орг": "Главный следящий за Неоф. Орг",
            "Следящий Пра-ва": "Следящий Правительства",
            "Следящий МЮ": "Следящий Министерства Юстиций",
            "Следящий МО": "Следящий Министерства обороны",
            "Следящий МЗ": "Следящий Министерства Здавоохранения",
            "Следящий СМИ": "Следящий за СМИ",
            "Следящий Гетто": "Следящий за Гетто",
            "Следящий Мафии": "Следящий за Мафиями",
            "Следящий Неоф. орг": "Следящий за неофициальными организациями",
            "Администратор 4 ур.": "Администратор 4 ур.",
            "Администратор 3 ур.": "Администратор 3 ур.",
            "Мл. Администратор [1-2 ур]": "Хелпер"
        }

        var additional_posts = { // Тут доп должности
            "Финансист": "Финансист",
            "Противодействие махинациям": "Противодействие махинациям",
            "Technical Administration 📡": "Technical Administration 📡",
            "Следящий за хелперами": "Следящий за хелперами",
            "Выдача Ролей": "Возможность Выдачи ролей",
            "Помощник след. за хелперами 📚": "Помощник след. за хелперами 📚",
            "Следящий за слётами 🎬": "Следящий за слётами 🎬",
            "Проверяющий ГОС": "Проверяющий ГОС"
        }

        var classes_signs_roles = {
            'Знак классности XV': 15,
            'Знак классности XIV': 14,
            'Знак классности XIII': 13,
            'Знак классности XII': 12,
            'Знак классности XI': 11,
            'Знак классности X': 10,
            'Знак классности IX': 9,
            'Знак классности VIII': 8,
            'Знак классности VII': 7,
            'Знак классности VI': 6,
            'Знак классности V': 5,
            'Знак классности IV': 4,
            'Знак классности III': 3,
            'Знак классности II': 2,
            "Знак классности I": 1
        }

        var sings_links = {
            1: "https://i.imgur.com/FcQGYsj.png",
            2: "https://i.imgur.com/N2WqkuT.png",
            3: "https://i.imgur.com/x8qPEvC.png",
            4: "https://i.imgur.com/pM6JBmY.png",
            5: "https://i.imgur.com/7K0b6ux.png",
            6: "https://i.imgur.com/ebUKL7H.png",
            7: "https://i.imgur.com/5PwsMY6.png",
            8: "https://i.imgur.com/fIiygIb.png",
            9: "https://i.imgur.com/nxvh5DZ.png",
            10: "https://i.imgur.com/JnyaBGB.png",
            11: "https://i.imgur.com/IQcDvlZ.png",
            12: "https://i.imgur.com/nC0CoxR.png",
            13: "https://i.imgur.com/apB7EXC.png",
            14: "https://i.imgur.com/kGHwOko.png",
            15: "https://i.imgur.com/pmXkMfI.png",
        }

        if (args[0]) {
            if (!message.member.roles.cache.some(r => ['Куратор', 'Главная администрация'].includes(r.name)) && !bot.developers.some(dev => dev == message.author.id)) {
                const messages = await message.reply({content: '**\`нет доступа!\`**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }
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
            var rUser = message.guild.members.cache.get(fUsers.id); // Получаем пользователя

            if (!rUser) {
                const messages = await message.reply({content: '**\`[ERROR]\` Данный пользователь не состоит в Discord сервере**'});
                setTimeout(() => messages.delete(), 10000);
                return
            }
            var hignest_role = function () {
                for (var r of Object.keys(posts)) {
                    for (var f of rUser.roles.cache) {
                        if (f[1].name == r) {
                            return posts[r]
                        }
                    }
                }
                return "Отсутствует"
            }

            // var hignest_znak = function () {
            //     for (var r of Object.keys(classes_signs_roles)) {
            //         for (var f of rUser.roles.cache) {
            //             if (f[1].name == r) {
            //                 return classes_signs_roles[r]
            //             }
            //         }
            //     }
            //     return "Отсутствует"
            // }

            var additional_post = function () {
                var str_posts = ""
                var count = 1
                for (var r of Object.keys(additional_posts)) {
                    for (var f of rUser.roles.cache) {
                        if (f[1].name == r) {
                            str_posts += `\n${count}) ${additional_posts[r]}`
                            count++;
                        }
                    }
                }
                if (isEmpty(str_posts)) return "Отсутствует"
                else return str_posts
            }

            bot.connection.query(`SELECT * FROM \`surprise_admins\` WHERE discord_id='${rUser.id}'`, function (err, result) {
                if (result.length == 0) {
                    var query = `INSERT INTO \`surprise_admins\` (\`discord_id\`,\`achiev\`) VALUES ('${rUser.id}', ';')`;
                    bot.connection.query(query, function (err, result) {
                        if (err) console.log(err);
                    });
                    return command(bot, message, args, developers, support_settings)
                }

                var achievments = result[0].achiev
                var znak = result[0].znak

                // var iteration_signs = function () {
                //     var number_sign = []
                //     if (number_class_sign == "\`Отсутствует\`") return "\`Отсутствует\`"
                //     for (var i = 0; i < number_class_sign; i++) {
                //         number_sign.push(`${classes_signs_emojies[i + 1]}`)
                //     }
                //     return number_sign.join(" | ")
                // }

                var post_embed = `**Должность: \`${hignest_role()}\`\n`
                var additional_post_embed = `Доп. должности: \`${additional_post()}\`\n`
                var znak_embed = znak

                var desc_embed = post_embed;
                if (additional_post() != "Отсутствует") desc_embed += additional_post_embed;
                desc_embed += "**";

                if ((achievments != ";")) {
                    var achievments_str = ""
                    var achiev_items = achievments.split(";")
                    var counter = 1
                    for (var i of achiev_items) {
                        if (isEmpty(i)) continue
                        achievments_str += `№${counter} - |${i}|\n`
                        counter++
                    }
                    desc_embed += `\`\`\`ARM\nАтчивки:\n${achievments_str}\`\`\``
                }

                let embed = new MessageEmbed()
                    .setColor("#ff3838")
                    .setAuthor(`Аrizona 🌴 Surprise`, `${rUser.guild.iconURL()}`)
                    .setTitle(`Профиль: \`${rUser.displayName}\``)
                    .setThumbnail(`${rUser.user.displayAvatarURL({format: 'png', size: 2048, dynamic: true})}`)
                    .setDescription(desc_embed)
                    .setFooter(`Администрация Arizona RP Surprise`)

                if (znak_embed != "0") embed.setImage(sings_links[znak_embed])

                message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 60000));
            })
        } else {
            var hignest_role = function () {
                for (var r of Object.keys(posts)) {
                    for (var f of message.member.roles.cache) {
                        if (f[1].name == r) {
                            return posts[r]
                        }
                    }
                }
                return "Отсутствует"
            }

            // var hignest_znak = function () {
            //     for (var r of Object.keys(classes_signs_roles)) {
            //         for (var f of message.member.roles.cache) {
            //             if (f[1].name == r) {
            //                 return classes_signs_roles[r]
            //             }
            //         }
            //     }
            //     return "Отсутствует"
            // }

            var additional_post = function () {
                var str_posts = ""
                var count = 1
                for (var r of Object.keys(additional_posts)) {
                    for (var f of message.member.roles.cache) {
                        if (f[1].name == r) {
                            str_posts += `\n${count}) ${additional_posts[r]}`
                            count++;
                        }
                    }
                }
                if (isEmpty(str_posts)) return "Отсутствует"
                else return str_posts
            }

            bot.connection.query(`SELECT * FROM \`surprise_admins\` WHERE discord_id='${message.author.id}'`, function (err, result) {
                if (result.length == 0) {
                    var query = `INSERT INTO \`surprise_admins\` (\`discord_id\`,\`achiev\`) VALUES ('${message.author.id}', ';')`;
                    bot.connection.query(query, function (err, result) {
                        if (err) console.log(err);
                    });
                    return command(bot, message, args, developers, support_settings)
                }

                var achievments = result[0].achiev
                var znak = result[0].znak

                // var iteration_signs = function () {
                //     var number_sign = []
                //     if (number_class_sign == "\`Отсутствует\`") return "\`Отсутствует\`"
                //     for (var i = 0; i < number_class_sign; i++) {
                //         number_sign.push(`${classes_signs_emojies[i + 1]}`)
                //     }
                //     return number_sign.join(" | ")
                // }

                var post_embed = `**Должность: \`${hignest_role()}\`\n`
                var additional_post_embed = `Доп. должности: \`${additional_post()}\`\n`
                var znak_embed = znak

                var desc_embed = post_embed;
                if (additional_post() != "Отсутствует") desc_embed += additional_post_embed;
                desc_embed += "**"
                if (achievments != ";") {
                    var achievments_str = ""
                    var achiev_items = achievments.split(";")
                    var counter = 1
                    for (var i of achiev_items) {
                        if (isEmpty(i)) continue
                        achievments_str += `№${counter} - |${i}|\n`
                        counter++
                    }
                    desc_embed += `\`\`\`ARM\nАтчивки:\n${achievments_str}\`\`\``
                }

                let embed = new MessageEmbed()
                    .setColor("#ff3838")
                    .setAuthor(`Аrizona 🌴 Surprise`, `${message.guild.iconURL({
                        format: 'png',
                        size: 2048,
                        dynamic: true
                    })}`)
                    .setTitle(`Профиль: \`${message.member.displayName}\``)
                    .setThumbnail(`${message.member.user.displayAvatarURL({format: 'png', size: 2048, dynamic: true})}`)
                    .setDescription(desc_embed)
                    .setFooter(`Администрация Arizona RP Surprise`)

                if (znak_embed != "0") embed.setImage(sings_links[znak_embed])

                message.channel.send({embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 60000));
            })
        }
    },
}
;
