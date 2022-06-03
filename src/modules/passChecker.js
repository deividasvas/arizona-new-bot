const { EmbedBuilder, Colors } = require("discord.js");
const getAllRolesIDAdmins = require("../components/getAllRolesIdAdmins");
const passTimer = require("../components/passTimer");

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы проверять срок окончания подписки и при необходимости удалять её.
  */
  autoRun: true, // автоматический запуск модуля
  name: "pass", // имя модуля
  acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot }) => {
        setInterval(() => {
            for(const [id, guild] of bot.guilds.cache) {
                const settings = [
                    {
                        type: 'family',
                    },
                    {
                        type: 'user'
                    }
                ]
            
                for(const setting of settings) {
                    if(setting.type == 'family') {
                        const fam = await Families.find({
                            familyPass
                        })
            
                        for(const FamiliesPass of fam) {
                            if (FamiliesPass.familyPass.dateEnd > new Date()) continue; // Если подписка не окончена - выходим
            
                            await FamiliesPass.updateOne({
                                familyPass: null
                            })
            
                            const adviceAdministrationChannel = guild.channels.cache.get(channelsId.administrationCouncil);
            
                            adviceAdministrationChannel.send({
                                embeds: [
                                    await new EmbedBuilder()
                                    .setTitle(`✏️ | Семейная подписка`)
                                    .setDescription(`**У семьи , владельцем которой является <@${FamiliesPass.ownerId}> закончилась подписка "Family Pass".**`)
                                    .setColor(Colors.Blue)
                                    .setTimestamp()
                                    .setFooter({
                                        text: 'Robo Hamster',
                                        iconURL: bot.user.displayAvatarURL()
                                    })
                                ]
                            })
                        }
                    }
            
                    if(setting.type == 'user') {
                        const user = await getCoinsProfile(el.id, id)
            
                        for(const SurpriseUserPass of user) {
                            if(SurpriseUserPass.userPass.dateEnd > new Date()) continue; // Если подписка не закончилась - выходим
            
                            await SurpriseUserPass.updateOne({
                                userPass: null
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
                                        text: 'Robo Hamster',
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
