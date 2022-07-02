const {
    EmbedBuilder, ApplicationCommandOptionType, Colors,
} = require("discord.js");
const getModerInfo = require("../../components/getModerInfo");
const updateModeratorTask = require("../../components/updateModeratorTask");
module.exports = {
    name: "give-task", // название команды
    descr: "Выдать/обновить задание модератору на снятие предупреждения", // описание команды
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration, rolesId.curatorModeration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [{
        name: "модератор",
        description: "Модератор которому Вы хотите выдать задание",
        type: ApplicationCommandOptionType.User,
        required: true,
    }, {
        name: "тикеты",
        description: "Количество тикетов необходимое для снятия предупреждения",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }, {
        name: "муты",
        description: "Количество мутов необходимое для снятия предупреждения",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }, {
        name: "кики",
        description: "Количество киков необходимое для снятия предупреждения",
        type: ApplicationCommandOptionType.Number,
        required: true,
    }, {
        name: "баны",
        description: "Количество банов необходимое для снятия предупреждения",
        type: ApplicationCommandOptionType.Number,
        required: true,
    },], // аргументы

    run: async ({bot, guild, args, interaction, channel, rolesId, channelsId}) => {
        // Модератор, которому будет выдано задание
        const moderator = guild.members.cache.get(args[0]);
        // Количество тикетов для снятия предупреждения
        const tickets = args[1];
        // Количество тикетов для снятия предупреждения
        const mutes = args[2];
        // Количество киков для снятия предупреждения
        const kicks = args[3];
        // Количество банов для снятия предупреждения
        const bans = args[4];

        const {error, warns, task} = await getModerInfo(bot, guild.id, moderator.id);
        if (error === "THE_NOT_MODERATOR") {
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**${moderator} не является модератором. Если это не так, то обратитесь к <@&${rolesId.techSection}>**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }
        if (!warns.filter(warnOrRebuke => warnOrRebuke.group === 'warn').length) {
            // если у модератора нет выговоров, то выкидываем ошибку.
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**${moderator} не имеет предупреждений**`)
                    .setColor(Colors.Blue)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }
        await updateModeratorTask(moderator.id, guild.id, {
            tickets,
            mutes,
            kicks,
            bans,
        });

        if (task.status === 'active') {
            return interaction.reply({
                ephemeral: channel.id !== channelsId.curators,
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Blue)
                        .setTitle(`📌 | Вы успешно обновили задание на`)
                        .setTimestamp()
                        .setDescription(`>>> **Муты: \`${mutes}\`\nКики: \`${kicks}\`\nБаны: \`${bans}\`\nТикеты: \`${tickets}\`**`)
                        .setAuthor({
                            name: guild.name, iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }


        interaction.reply({
            ephemeral: channel.id !== channelsId.curators,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(`📌 | Вы успешно выдали задание`)
                    .setTimestamp()
                    .setDescription(`>>> **Муты: \`${mutes}\`\nКики: \`${kicks}\`\nБаны: \`${bans}\`\nТикеты: \`${tickets}\`**`)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })

    },
};
