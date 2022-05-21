const {
    EmbedBuilder, ApplicationCommandOptionType, Colors,
} = require("discord.js");
const fs = require("fs");
module.exports = {
    name: "rolemember", // название команды
    descr: "Получение информации о том, сколько людей имеют роль", // описание команды
    perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster, rolesId.adviceAdministration, rolesId.curatorModeration], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [{
        name: "роль",
        description: "Роль у которой Вы хотите узнать количество её пользователей",
        type: ApplicationCommandOptionType.Role,
        required: true,
    },], // аргументы

    run: async ({bot, guild, args, interaction}) => {
        const roleId = args[0];
        const role = guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({
                ephemeral: true, embeds: [await new EmbedBuilder()
                    .setTitle(`❌ | Ошибка!`)
                    .setDescription(`**Данной роли не существует**`)
                    .setColor(Colors.Red)
                    .setTimestamp()
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    })],
            });
        }

        if (role.members.map(m => m.id).join('\n').length > 4000) {
            let allUsersString = role.members.map(member => `Участник ${member.displayName}`).join("\n")
            await fs.appendFileSync(`./members.txt`, `${allUsersString.slice(0, allUsersString.length / 2).trim()}${allUsersString.slice(allUsersString.length / 2).trim()}`)
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setDescription(`Очень много пользователей с данной ролью на сервере. На данный момент **${colv} пользователей** с этой ролью на сервере`)],
                files: ['./members.txt']
            });
            await fs.unlinkSync(`./members.txt`);
        } else {
            interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`Пользователи с ролью "${role.name}"`)
                    .setAuthor({
                        name: guild.name, iconURL: guild.iconURL(),
                    })
                    .setFooter({
                        text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL(),
                    })
                    .setDescription(`**${role.members.map(member => `<@${member.id}>`).join(`\n`)}**`)]
            })
        }
    },
};
