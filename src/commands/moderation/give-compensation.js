const {
    EmbedBuilder,
    Colors,
    ApplicationCommandOptionType, ActionRowBuilder, SelectMenuBuilder,
} = require("discord.js");
const {compensationsOptions} = require("../../modules/compensations");


module.exports = {
    name: "give-compensation", // название команды
    descr: "Выдать пользователю компенсацию за неверное наказание", // описание команды
    showInSlashCommands: true, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description:
                "Пользователь которому выдаётся компенсация",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ], // аргументы
    perms: (rolesId) => [
        rolesId.mainAdmin,
        rolesId.deputyMainAdmin,
        rolesId.curator,
        rolesId.discordMaster,
        rolesId.juniorDiscordMaster,
        rolesId.adviceAdministration,
        rolesId.curatorModeration
    ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

    run: async ({bot, interaction, author, guild, args, rolesId}) => {
        interaction.reply({
            ephemeral: false,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(
                        `🤑 | Выдача компенсации`
                    )
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Выберите компенсацию которую хотите выдать для <@${args[0]}>**`
                    )
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new SelectMenuBuilder()
                            .setCustomId('select-compensation')
                            .addOptions(compensationsOptions)
                    )
            ]
        })
    },
};
