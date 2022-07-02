const {EmbedBuilder, Colors} = require("discord.js");

module.exports = {
    name: "mafia", // название команды
    descr: "Выдача/снятие роли игрок мафии", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [], // аргументы
    perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, author, rolesId, interaction, guild}) => {
        if (author.roles.cache.some((role) => rolesId.mafia === role.id)) {
            author.roles.remove(rolesId.mafia);
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`📌 | Снятие роли`)
                        .setDescription(
                            `**Вы успешно сняли роль <@&${rolesId.mafia}>!**`
                        )
                        .setColor(Colors.Blue)
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
        }
        author.roles.add(rolesId.mafia, `Выдача роли Mafia через команду`);

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Получение роли`)
                    .setDescription(
                        `**Вы успешно получили роль <@&${rolesId.mafia}>!**`
                    )
                    .setColor(Colors.Blue)
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
    },
};
