const {EmbedBuilder, Colors} = require("discord.js");
const handleErrors = require("../components/handleErrors.js");
const {developers} = require("../configs/settings.js");
const settings = require("../configs/settings.js");
const CommandsDisabled = require("../models/CommandsDisabled.js");

module.exports = async (bot, interaction) => {
    if (interaction.isChatInputCommand()) {
        // если это команда, то мы её обрабатываем
        const {commandName, commandId, guild, channelId} = interaction;
        const command = bot.commands.get(commandName);
        if (!command) {
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`🚫 | Ошибка!`)
                    .setDescription(`**Ожидайте, происходит инициализация бота...**`)
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }
        if (await CommandsDisabled.findOne({
            commandName,
        }) || command.archive) {
            // Проверяем находится ли команда в выключенных или в архиве. Если да, то выдаём ошибку
            await bot.deleteSlashCommand(commandId, guild);
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`🚫 | Ошибка!`)
                    .setDescription(`**Команда \`${commandName}\` отключена!**`)
                    .setColor(Colors.DarkRed)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    }),],
            });
        }
        const args = interaction.options._hoistedOptions.map((arg) => arg.value);
        const author = interaction.member;
        const channel = interaction.guild.channels.cache.get(channelId) || (await interaction.guild.channels.fetch(channelId));
        const rolesId = settings.rolesId[guild.id];
        const channelsId = settings.channelsId[guild.id];
        const whiteListRoles = settings.whiteListRoles[guild.id];
        const categories = settings.categories[guild.id];
        const fromPostToPostList = settings.fromPostToPostList[guild.id];
        return command
            .run({
                interaction,
                whiteListRoles,
                categories,
                rolesId,
                channelsId,
                author,
                guild,
                bot,
                fromPostToPostList,
                channel,
                args,
                developers,
                theSlashCall: true,
            })
            .catch((err) => handleErrors(err, bot));
    }
    if (interaction.isButton()) {
        // если это кнопка, то передаём её модулям
        for (const module of bot.modules.values()) {
            // берём все модули и смотрим в каком принимаются айдишники которые нам нужны
            const {acceptCustomsId} = module;
            if (acceptCustomsId.includes(interaction.customId)) {
                const {member, user, guild, message} = interaction;
                module.run({bot, member, user, interaction, guild, message}); // запускаем модуль
            }
        }
    }
}
;
