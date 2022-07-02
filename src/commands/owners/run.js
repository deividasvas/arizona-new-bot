const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
module.exports = {
    name: "run", // название команды
    descr: "Запускает JavaScript код", // описание команды
    perms: (rolesId) => [rolesId.techSection], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "код",
            description: "Код который будет запущен",
            type: ApplicationCommandOptionType.String,
            required: true,
        },
    ], // аргументы

    run: async ({bot, interaction, channel, guild, rolesId, args, developers, author, channelsId}) => {

        if (!developers.includes(author.user.id))
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(`**Вам недоступна данная команда**`)
                        .setColor(Colors.Blue)
                        .setTimestamp()
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Surprise Bot`,
                            iconURL: bot.user.displayAvatarURL(),
                        }),
                ],
            });
        const code = args[0];
        const testChannel =
            bot.channels.cache.get(channelsId.testRoom) ||
            (await guild.channels.fetch(channelsId.testRoom));
        testChannel.send({
            content: `<@&${rolesId.techSection}>`,
            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Оповещение об использовании команды run!")
                    .setDescription(
                        `**Отправлено с ${channel} \`[${channel.id}]\`\nОтправил: ${author} \`[${author.user.id}]\`\n\nКод:\n\`\`\`js\n${code}\`\`\`**`
                    )
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
        interaction.reply({
            ephemeral: true,

            embeds: [
                new EmbedBuilder()
                    .setTitle("📌 | Оповещение об использовании команды run!")
                    .setDescription(`**JavaScript выражение было успешно запущено!**`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
        eval(code);
    },
};
