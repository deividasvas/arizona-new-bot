const {EmbedBuilder, ApplicationCommandOptionType, Colors} = require("discord.js");
const settings = require("../../configs/settings");
const {rolesId} = require("../../configs/settings");
const getUserProfile = require("../../components/getUserProfile");
const Profiles = require("../../models/Profiles");
const sendUserMessage = require("../../components/sendUserMessage");
module.exports = {
    name: "nick-add", // название команды
    descr: "Добавить пользователя в список людей которым доступно использование нестандартного шрифта", // описание команды
    perms: () => [
        rolesId.discordMaster,
        rolesId.juniorDiscordMaster,
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

    async run({bot, interaction, channel, args, developers, author, guild}) {
        const userId = args[0];
        const profile = await getUserProfile(userId, guild.id);
        if (profile.IsUserCanUseCustomFontInNickname) {
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**<@${userId}> уже имеет привилегию использовать нестандартный шрифт в нике.**`
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
        await Profiles.updateOne({
            userId,
            guildId: guild.id
        }, {
            IsUserCanUseCustomFontInNickname: true,
        });
        interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Добавление в базу данных!")
                    .setDescription(
                        `**Пользователь <@${userId}>, был добавлен в базу данных нестандартных шрифтов в нике**`
                    )
                    .setColor(Colors.DarkGreen)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        });
        await sendUserMessage({
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Новые возможности!")
                    .setDescription(
                        `**Администратор ${author} дал Вам право использовать нестандартный шрифт в никнейме**`
                    )
                    .setColor(Colors.DarkGreen)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        }, userId, guild);
    },
};
