const { rolesId: _rolesId, channelsId: _channelsId, categories: _categories} = require("../configs/settings");
const getAllRolesIdState = require("../components/getAllRolesIdState");
const {EmbedBuilder, Colors} = require("discord.js");

module.exports = {
    /*
      Описание модуля
      Данный модуль создан для того, чтобы обрабатывать запросы ролей.
    */
    name: "requestForRoles", // имя модуля
    acceptCustomsId: [
        "addRolesRequest",
        "removeRolesRequest",
        "addOrRemoveRoleX",
    ], // модуль автоматически принимает эти айдишники interaction.customId
    async removeRolesRequest({ bot, guild, member, rolesId, interaction }){
        const allStateRolesId = getAllRolesIdState(rolesId);
        member.roles.remove(allStateRolesId);
        interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Снятие ролей!")
                    .setDescription(
                        `**Вы успешно сняли с себя все роли организации!**`
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
        })
    },
    async addOrRemoveRoleX({ bot, interaction, member, rolesId, guild }){
        if(member.roles.cache.has(rolesId.x)){
            member.roles.remove(rolesId.x);
            return interaction.reply({
                ephemeral: true,
                embeds: [
                    await new EmbedBuilder()
                        .setTitle("📌 | Снятие ролей!")
                        .setDescription(
                            `**Вы успешно сняли с себя роль <@&${rolesId.x}>!**`
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
            })
        }

        member.roles.add(rolesId.x);
        return interaction.reply({
            ephemeral: true,
            embeds: [
                await new EmbedBuilder()
                    .setTitle("📌 | Выдача ролей!")
                    .setDescription(
                        `**Вы успешно выдали себе роль <@&${rolesId.x}>!**`
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
        })
    },
    async run({ interaction, bot }) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        const guild = bot.guilds.cache.get(interaction.guildId);
        const member = interaction.member;
        const rolesId = _rolesId[guild.id];
        const channelsId = _channelsId[guild.id];
        const categoriesId = _categories[guild.id];
        const actions = [
            {
                customId: "removeRolesRequest",
                func: this.removeRolesRequest
            },
            {
                customId: "addOrRemoveRoleX",
                func: this.addOrRemoveRoleX,
            }
        ]

        const action = actions.find(action => action.customId === interaction.customId);
        if(action){
            await action.func({
                bot,
                guild,
                member,
                rolesId,
                channelsId,
                categoriesId,
                interaction,
            });
        }
    },
};
