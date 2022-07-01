const {ButtonStyle, ActionRowBuilder, ButtonBuilder, EmbedBuilder, Colors} = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const {getGuildChannelsId, getGuildRolesId} = require("../../configs/settings");

module.exports = {
    name: "use-compensation", // название команды
    descr: "Активировать талон компенсации", // описание команды
    isDMCommand: true, // это команда работает только в личных сообщениях
    arguments: [], // аргументы
    perms: () => [], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author}) => {
        const guilds = [];
        const {dmChannel} = author;
        for (const [id, guild] of bot.guilds.cache) {
            guilds.push({
                id,
                name: guild.name,
            })
        }
        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`⏳ | Выбор!`)
                    .setDescription(`**Выберите один из серверов где у Вас есть талоны.\nУ Вас одна минута!**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        guilds.map(guild => {
                            return new ButtonBuilder()
                                .setLabel(guild.name)
                                .setCustomId(`guild-${guild.id}`)
                                .setStyle(ButtonStyle.Success)
                        })
                    )
            ]
        })

        const button = await dmChannel.awaitMessageComponent({
            time: 60000,
            limit: 1,
            filter: i => i.user.id === author.id && guilds.map(guild => `guild-${guild.id}`).includes(i.customId)
        }).then(interaction => {
            interaction.deferUpdate();
            return interaction;
        }).catch(() => {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚫 | Время!`)
                        .setDescription(`**Упс... Вы не успели. Повторите попытку**`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ],
                components: [],
            })
        });


        // Получаем гильдию с помощью разделения по черте и выборке второго элемента, то есть, айдишника.
        const guild = bot.guilds.cache.get(button.customId.split('-')[1]);

        const {compensations: _compensations} = await getCoinsProfile(author.id, guild.id);

        // Фильтруем компенсации на те которые можно использовать.
        const compensations = _compensations.filter(compensation => compensation.type === 'moneyAndLvl');

        if (compensations.length === 0) {
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚫 | Ложь!`)
                        .setDescription(`**У Вас нет никаких компенсации которые можно использовать на сервере \`${guild.name}\`!**`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ],
                components: [],
            })
        }

        // Варианты которые, будут выведены в кнопки.
        const variants = [];
        for (const compensation of compensations) {
            const variant = variants.find(variant => compensation.label === variant.label);
            if (variant) {
                variant.count++;
                continue;
            }
            variants.push({
                count: 1,
                label: compensation.label,
            });
        }

        // await interaction.deferReply();
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`⏳ | Выбор!`)
                    .setDescription(`**Выберите одну из компенсации которую Вы хотите использовать на сервере \`${guild.name}\`**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        variants.map(variant => {
                            return new ButtonBuilder()
                                .setLabel(`${variant.label} | ${variant.count}`)
                                .setCustomId(`compensation-btn-${variant.label}-${variant.count}`)
                                .setStyle(ButtonStyle.Success)
                        })
                    )
            ]
        })

        const compensationValueButton = await dmChannel.awaitMessageComponent({
            time: 60000,
            limit: 1,
            filter: i => i.user.id === author.id && variants.map(variant => `compensation-btn-${variant.label}-${variant.count}`).includes(i.customId)
        }).catch(() => {
            interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🚫 | Время!`)
                        .setDescription(`**Упс... Вы не успели. Повторите попытку!**`)
                        .setColor(Colors.Red)
                        .setTimestamp()
                        .setFooter({
                            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                        })
                ],
                components: [],
            })
        });
        if(!compensationValueButton){
            return;
        }
        // Выбранная компенсация пользователем.
        const _selectedCompensationVariant = variants.find(variant => `compensation-btn-${variant.label}-${variant.count}` === compensationValueButton.customId);
        const selectedCompensation = compensations.find(compensation => compensation.label === _selectedCompensationVariant.label);

        // Выдаём компенсация пользователю.
        await setUserCoinsParam(author.id, guild.id, 'coins', ({coins}) => coins + selectedCompensation.money);
        const channelsId = getGuildChannelsId(guild.id);
        const rolesId = getGuildRolesId(guild.id);
        const administrationDiscordChannel = guild.channels.cache.get(channelsId.administrationCouncil);
        administrationDiscordChannel.send({
            content: `<@&${rolesId.adviceAdministration}><@&${rolesId.juniorDiscordMaster}> необходимо выдать пользователю ${author} - \`${selectedCompensation.level}\` уровня(ей)`
        });

        await setUserCoinsParam(author.id, guild.id, 'compensations', ({compensations}) => {
            // Получаем индекс выбранной компенсации, чтобы удалить её из БД.
            const index = compensations.findIndex(compensation => {
                return compensation.label === selectedCompensation.label;
            });
            // Если индекс не найден, то просто возвращаем текущий массив.
            if (index === -1) return compensations;
            // Если индекс найден, то удаляем его из массива и возвращаем уже новый массив.
            delete compensations[index];
            return compensations.filter(compensation => !!compensation);
        });

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`✅ | Успешно!`)
                    .setDescription(`**Поздравляю! Вы успешно активировали компенсацию \`${selectedCompensation.label}\`! За выдачей уровня обратитесь в канал <#${channelsId.support}>**`)
                    .setColor(Colors.Green)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
                    })
            ],
            components: [],
        });
    },
};