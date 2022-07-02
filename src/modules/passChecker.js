const { EmbedBuilder, Colors } = require("discord.js");
const Families = require("../models/Families");
const { getGuildRolesId, getGuildChannelsId } = require('../configs/settings');
const CoinsUsers = require("../models/CoinsUsers");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы проверять срок окончания подписки и при необходимости удалять её.
  */
  autoRun: true, // автоматический запуск модуля
  name: "pass", // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot }) => {
        setInterval(async() => {
            for(const [id, guild] of bot.guilds.cache) {
                const channelsId = getGuildChannelsId(guild.id);
                const rolesId = getGuildRolesId(guild.id);
                const settings = [
                    {
                        type: 'family',
                    },
                    {
                        type: 'user'
                    }
                ]
            
                for(const setting of settings) {
                    if(setting.type === 'family') {
                        const fam = await Families.find({ // Ищем семью с подпиской в базе данных
                            endDateFamilyPass: { $ne : null }
                        })
            
                        for(const pass of fam) {
                            if (pass.endDateFamilyPass > new Date()) continue; // Если подписка не окончена - выходим
            
                            await Families.updateOne({
                                ...pass
                            }, {
                                endDateFamilyPass: null
                            })
            
                            const adviceAdministrationChannel = guild.channels.cache.get(channelsId.administrationCouncil);
            
                            adviceAdministrationChannel.send({
                                embeds: [
                                    await new EmbedBuilder()
                                    .setTitle(`✏️ | Семейная подписка`)
                                    .setDescription(`**У семьи <@&${pass.roleId}>, владельцем которой является <@${pass.ownerId}> закончилась подписка "Family Pass".**`)
                                    .setColor(Colors.Blue)
                                    .setTimestamp()
                                    .setFooter({
                                        text: 'Surprise Bot',
                                        iconURL: bot.user.displayAvatarURL()
                                    })
                                ]
                            })
                        }
                    }
            
                    if(setting.type === 'user') {
                        const users = await CoinsUsers.find({
                            userPass: {
                                $ne: null
                            }
                        })
            
                        for(const pass of users) {
                            if(pass.userPass > new Date()) continue; // Если подписка не закончилась - выходим
            
                            await CoinsUsers.updateOne({
                                ...pass
                            }, {
                                userPass: null,
                                sendEmojiAndStickersFromOtherServers: null,
                                isActiveCustomFontInNickname: false
                            })
            
                            const adviceAdministrationChannel = guild.channels.cache.get(channelsId.administrationCouncil);
            
                            adviceAdministrationChannel.send({
                                embeds: [
                                    await new EmbedBuilder()
                                    .setTitle(`✏️ | Пользовательская подписка`)
                                    .setDescription(`**У пользователя <@${el.id}> закончилась пользовательская подписка.**`)
                                    .setColor(Colors.Blue)
                                    .setTimestamp()
                                    .setFooter({
                                        text: 'Surprise Bot',
                                        iconURL: bot.user.displayAvatarURL()
                                    })
                                ]
                            })
                        }
                    }
                }
            }
        }, 50000)
    },
};
