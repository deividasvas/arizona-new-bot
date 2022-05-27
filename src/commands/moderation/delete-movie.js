const {
    EmbedBuilder,
    Colors,
    ApplicationCommandOptionType,
} = require("discord.js");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");

module.exports = {
    name: "delete-movie", // название команды
    descr: "Удаление канала фильма", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "канал",
            description: "Канал который будет удалён",
            type: ApplicationCommandOptionType.Channel,
            required: true,
        }
    ], // аргументы
    perms: (rolesId) => getAllRolesIdModers(rolesId), // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, categories, guild, args, channel}) => {
        const channelId = args[0];
        const channelForDelete = guild.channels.cache.get(channelId);

        if (!channelForDelete) {
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**Канала не существует на сервере!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    })],
            });
        }

        // Проверяем находится ли канал в нужной нам категории.
        if (channel.parentId !== categories.movies) {
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**Канал ${channelForDelete} невозможно удалить при помощи данной команды!**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    })],
            });
        }

        channel.delete();

        interaction.reply({
            embeds: [
                await new EmbedBuilder()
                    .setAuthor({
                        name: `📌 | Удаление канала`,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вы успешно удалили канал \`${channel.name}\`**`
                    )
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        })

    },
};
