const {
    EmbedBuilder, ApplicationCommandOptionType, Colors,
} = require("discord.js");
const sendUserMessage = require("../../components/sendUserMessage");

module.exports = {
    name: "create-role", // название команды
    descr: "Создать персональную роль", // описание команды
    showInSlashCommands: false, // показывать ли команду в slash командах
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    arguments: [{
        name: "владелец",
        description: "Владелец персональной роли которая будет создана",
        type: ApplicationCommandOptionType.User,
        required: true,
    }, {
        name: "цвет",
        description: "Цвет персональной роли которая будет создана",
        type: ApplicationCommandOptionType.String,
        required: true,
    }, {
        name: "название",
        description: "Название персональной роли которая будет создана",
        type: ApplicationCommandOptionType.String,
        required: true,
    },], // аргументы

    async run({bot, interaction, args, guild, author, rolesId, channelsId, categories}) {
        const roleName = args[2]; // Название семьи
        const color = args[1]; // Цвет семьи
        // Человек для которого создаётся роль
        const member = guild.members.cache.get(args[0]) || (await guild.members.fetch(args[0]));

        // Категория ролей под которой будет располагаться роль
        const categoryPosition = guild.roles.cache.find(role => role.id === categories.peopleRoles).position;

        const role = await guild.roles.create({
            name: roleName, color, permission: [], position: categoryPosition - 1,
        });
        member.roles.add(role, `Создание кастом роли by ${author.tag}`);
        const dmChannel = guild.channels.cache.get(channelsId.discordMasters);
        dmChannel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Была создана персональная роль`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
                    .addFields([{
                        name: `**Кто создал**`, value: `**<@${author.id}>**`, inline: false
                    }, {
                        name: `**Пользователь**`, value: `**${member}**`, inline: false
                    }, {
                        name: `**Роль**`, value: `**${role}**`, inline: false
                    }, {
                        name: `**Цвет**`, value: `**\`${color}\`**`, inline: false
                    }])]
        });
        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setTitle(`📌 | Успешно!`)
                    .setColor(Colors.Blue)
                    .setTimestamp()
                    .setDescription(`**Вы успешно создали персональную роль ${role} для пользователя ${member}**`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Surprise Bot`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
        await sendUserMessage({
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Новые возможности!")
                    .setDescription(
                        `**Администратор ${author} создал для Вас персональную роль под названием \`${roleName}\`**`
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
                    })
            ]
        }, member.id, guild);
    },
};
