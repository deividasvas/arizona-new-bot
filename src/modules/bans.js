const {EmbedBuilder, Colors, Attachment} = require("discord.js");
const ban = require("../components/ban");
const getAllRolesIdModers = require("../components/getAllRolesIdModers");
const parseUserIdFromMention = require("../components/parseIdFromMention");
const sendUserMessage = require("../components/sendUserMessage");
const {rolesId, channelsId} = require("../configs/settings");
const BansVotes = require("../models/BansVotes");
const fs = require("fs");
const path = require("path");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы обработать кнопки эмбедов банов у модераторов.
    */
    name: "bans", // имя модуля
    acceptCustomsId: ["banYes", "banNo"], // модуль автоматически принимает эти айдишники interaction.customId
    async banUser(bot, interaction, userId, days, reason, moderatorId) {
        await BansVotes.deleteOne({
            moderatorSenderId: moderatorId,
            userForBanId: userId,
        });

        const bansLogsChannel = interaction.guild.channels.cache.get(
            channelsId[interaction.guild.id].rolesAndBans
        ); // канал куда отправляются логи банов
        await bansLogsChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Система блокировки пользователей!`)
                    .setColor(Colors.Red)
                    .setAuthor({
                        name: interaction.guild.name,
                        iconURL: interaction.guild.iconURL(),
                    })
                    .setDescription(
                        `**「📝」Запросил бан: <@${moderatorId}>\n「📌」Кому: <@${userId}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
        await sendUserMessage(
            {
                content: `Если Вы не согласны с наказанием, то обжаловать наказание можно здесь - https://forum.robo-hamster.ru/forums/49/`,
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.DarkGreen)
                        .setTitle(`📌 | Вам выдали блокировку!`)
                        .setAuthor({
                            name: interaction.guild.name,
                            iconURL: interaction.guild.iconURL(),
                        })
                        .setDescription(
                            `**「📝」Выдал бан: <@${moderatorId}>\n「📅」Дней Бана: \`${days}\`\n「📕」Причина: \`${reason}\`**`
                        )
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            },
            userId,
            interaction.guild
        );
        await ban(bot, interaction.guildId, userId, moderatorId, days, reason);
    },
    async run({bot, interaction, member: user, guild}) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше

        if (
            !user.roles.cache.find((role) => getAllRolesIdModers().includes(role.id))
        ) {
            // если у пользователя который нажал на кнопку нет модерских ролей, то отдаём ошибку
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Вы не являетесь модератором. Если это не так, то обратитесь к <@&${rolesId[guild.id].techSection}>**`
                        )
                        .setColor(Colors.Red)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        }
        const rows = interaction.message.embeds[0].fields[0].value.split("\n");
        const getValue = (index) => rows[index].split(":")[1].trimStart().slice(2); // функция которая отдаёт значение из колонок
        /*
        Колонки под которые это всё строилось(пример):
         value: `>>> \`Отправитель:\` ${author}\n\`Нарушитель:\` ${userForBan}\n\`Статус нарушителя:\` ${
                  statusUserRoleId ? `<@&${statusUserRoleId}>` : `Пользователь`
                }\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: 0\n\`\`Против\`\`: 0`,
        */
        const moderatorSender = guild.members.cache.find(
            (member) =>
                `<@${member.id}>` === getValue(0) || `<@!${member.id}>` === getValue(0)
        ); // модератор отправитель
        const userForBanId = parseUserIdFromMention(getValue(1)); // пользователь который будет забанен

        const ban = await BansVotes.findOne({
            moderatorSenderId: moderatorSender.id,
            userForBanId,
        });

        if (!ban) {
            // проверяем факт существования действующей блокировки, если его нет, то удаляем сообщение бана
            return interaction.message.delete();
        }
        const {days, reason, agrees, denies} = ban; // данные из бана
        const moderationChannel = guild.channels.cache.get(channelsId[guild.id].moderation); // канал куда отправится сообщение в случае чего
        const pathToFile = path.resolve(`./${interaction.message.id}.txt`);
        await fs.writeFileSync(pathToFile, `Информация по голосам бана №${interaction.message.id}`);
        for (const agreeUserId of agrees) {
            await fs.appendFileSync(pathToFile, `[YES] ${guild.members.cache.get(agreeUserId)}, ID: ${agreeUserId}\n`)
        }

        for (const denyUserId of denies) {
            await fs.appendFileSync(pathToFile, `[NO] ${guild.members.cache.get(denyUserId)}, ID: ${denyUserId}\n`)
        }
        if (agrees.length >= 5) {
            // если более 5 позитивных голосов за бан, то баним
            interaction.message.delete();
            await this.banUser(
                bot,
                interaction,
                userForBanId,
                days,
                reason,
                moderatorSender.id
            );
            await moderationChannel.send({
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`✅ | Успешная блокировка пользователей!`)
                        .setDescription(
                            `**Пользователь ${userForBanId} был успешно заблокирован на \`${days}\` по причине \`${reason}\` по голосованию модераторов. Запросил: ${moderatorSender.id}**`
                        )
                        .setColor(Colors.DarkGreen)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
                files: [pathToFile]
            });
            return fs.unlinkSync(pathToFile);
        }

        if (denies.length >= 5) {
            // если более 5 голосов отрицательных, то не баним
            interaction.message.delete();
            await moderationChannel.send({
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Упс..`)
                        .setDescription(
                            `**Пользователь ${userForBanId} был отказан от блокировки по голосованию модераторов. Запросил: ${moderatorSender.id}**`
                        )
                        .setColor(Colors.Red)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
                files: [pathToFile]
            });
            return fs.unlinkSync(pathToFile);
        }

        if (
            user.permissions.has("Administrator") ||
            user.roles.cache.some((role) => role.id === rolesId[guild.id].juniorDiscordMaster)
        ) {
            // если пользователь является администратором или является Jr. Discord Master, то одобряем или отказываем бан автоматически
            interaction.message.delete();

            if (interaction.customId === "banYes") {
                await this.banUser(
                    bot,
                    interaction,
                    userForBanId,
                    days,
                    reason,
                    moderatorSender.id
                );

                await moderationChannel.send({
                    embeds: [
                        await new EmbedBuilder()
                            .setTitle(`✅ | Одобрение блокировки пользователя!`)
                            .setDescription(
                                `**Администратор ${user} одобрил блокировку пользователя <@${userForBanId}>\n\n\`Отправил\`: ${moderatorSender}\n\`Пользователь\`: <@${userForBanId}>\n\`Причина блокировки\`: ${reason}**`
                            )
                            .setColor(Colors.DarkGreen)
                            .setAuthor({
                                name: guild.name,
                                iconURL: guild.iconURL(),
                            })
                            .setFooter({
                                text: `Robo Hamster`,
                                iconURL: bot.user.displayAvatarURL(),
                            }),
                    ],
                });
                return fs.unlinkSync(pathToFile);
            }

            if (interaction.customId === "banNo") {
                await BansVotes.deleteOne({
                    ...ban,
                }); // удаляем данные о голосовании из бд
                await moderationChannel.send({
                    embeds: [
                        await new EmbedBuilder()
                            .setTitle(`❌ | Отклонение блокировки пользователя!`)
                            .setDescription(
                                `**Администратор ${user} отклонил блокировку пользователя <@${userForBanId}>\n\n\`Отправил\`: ${moderatorSender}\n\`Пользователь\`: <@${userForBanId}>\n\`Причина блокировки\`: ${reason}**`
                            )
                            .setColor(Colors.Red)
                            .setAuthor({
                                name: guild.name,
                                iconURL: guild.iconURL(),
                            })
                            .setFooter({
                                text: `Robo Hamster`,
                                iconURL: bot.user.displayAvatarURL(),
                            }),
                    ],
                });
                return fs.unlinkSync(pathToFile);
            }
        }

        if (interaction.customId === "banYes") {
            await ban.updateOne({
                $set: {
                    agrees: [...agrees, user.id],
                    denies: denies.filter((userId) => userId !== user.id),
                },
            }); // обновляем в бд всё так, чтобы нельзя было проголосовать одновременно и за то и за то
            const {denies: actualDenies, agrees: actualAgrees} =
                await BansVotes.findOne({
                    moderatorSenderId: moderatorSender.id,
                    userForBanId: userForBanId,
                }); // получаем актуальные голоса и меняем эмбед
            await interaction.message.edit({
                content: `<@&${rolesId[guild.id].juniorModerator}>`,
                embeds: [
                    new EmbedBuilder()
                        .setAuthor(interaction.message.embeds[0].author)
                        .addFields([{
                            name: `Информация:`,
                            value: `>>> \`Отправитель:\` ${moderatorSender}\n\`Нарушитель:\` <@${userForBanId}>\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: ${actualAgrees.length}\n\`\`Против\`\`: ${actualDenies.length}`,
                            inline: false,
                        }])
                        .setColor(interaction.message.embeds[0].color)
                        .setTimestamp()
                        .setFooter(interaction.message.embeds[0].footer),
                ],
                files: [pathToFile]
            });
            return fs.unlinkSync(pathToFile);
        }

        if (interaction.customId === "banNo") {
            await ban.updateOne({
                $set: {
                    denies: [...denies, user.id],
                    agrees: agrees.filter((userId) => userId !== user.id),
                },
            }); // получаем актуальные голоса и меняем эмбед
            const {denies: actualDenies, agrees: actualAgrees} =
                await BansVotes.findOne({
                    moderatorSenderId: moderatorSender.id,
                    userForBanId,
                });

            await interaction.message.edit({
                content: `<@&${rolesId[guild.id].juniorModerator}>`,
                embeds: [
                    new EmbedBuilder()
                        .setAuthor(interaction.message.embeds[0].author)
                        .addFields([{
                            name: `Информация:`,
                            value: `>>> \`Отправитель:\` ${moderatorSender}\n\`Нарушитель:\` <@${userForBanId}>\n\`Дней блокировки:\` ${days}\n\`Причина:\` ${reason}\n\n\`За\`: ${actualAgrees.length}\n\`\`Против\`\`: ${actualDenies.length}`,
                            inline: false,
                        }])
                        .setColor(interaction.message.embeds[0].color)
                        .setTimestamp()
                        .setFooter(interaction.message.embeds[0].footer),
                ],
                files: [pathToFile]
            });
        }
        return fs.unlinkSync(pathToFile);
    },
};
