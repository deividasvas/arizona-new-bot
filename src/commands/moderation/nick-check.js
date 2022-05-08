const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const getUserProfile = require("../../components/getUserProfile");
module.exports = {
    name: "nick-check", // название команды
    descr: "Проверить пользователя на привилегию иметь нестандартный шрифт", // описание команды
    perms: (rolesId) => [
        rolesId.discordMaster,
        rolesId.juniorDiscordMaster,
        rolesId.adviceAdministration,
        rolesId.curatorModeration,
        rolesId.moderator,
        rolesId.juniorModerator
    ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "пользователь",
            description: "Пользователь которому будет выдана привилегия использовать нестандартный шрифт",
            type: ApplicationCommandOptionType.User,
            required: true,
        },
    ], // аргументы

    async run({bot, interaction, channel, args, rolesId, channelsId, guild}) {
        const userId = args[0];
        const { IsUserCanUseCustomFontInNickname } = await getUserProfile(userId, guild.id);
        const member = guild.members.cache.get(userId);
        interaction.reply({
            ephemeral: channel.id === channelsId.moderation,
            embeds: [
                await new EmbedBuilder()
                    .setTitle(`Пользователь: \`${member.displayName}\``)
                    .setColor(Colors.Red)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .addFields([{
                        name: `**Возможность иметь нестандартный шрифт в нике**`,
                        value: `\`Не куплена\` ❌`,
                        value: IsUserCanUseCustomFontInNickname === false ? '\`Не куплена\` ❌' : '\`Куплена\` ✅',
                        inline: true
                    }])
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    },
};