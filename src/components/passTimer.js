const { EmbedBuilder } = require("@discordjs/builders");
const { Colors } = require("discord.js");
const { channelsId } = require("../configs/settings");
const Families = require("../models/Families");
const getCoinsProfile = require("./getCoinsProfile");
const sendUserMessage = require("./sendUserMessage");

const passTimer = (bot, guild, executer) => {
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

            for(const fpass of fam) {
                if (fpass.familyPass.dateEnd > new Date()) continue; // Если подписка не окончена - выходим

                await fpass.updateOne({
                    familyPass: null
                })

                const adviceAdministrationChannel = guild.channels.cache.get(channelsId.administrationCouncil);

                adviceAdministrationChannel.send({
                    embeds: [
                        await new EmbedBuilder()
                        .setTitle(`✏️ | Семейная подписка`)
                        .setDescription(`**У семьи , владельцем которой является <@${fpass.ownerId}> закончилась подписка "Family Pass".**`)
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
            const user = await getCoinsProfile(executer.id, '948675243025764404')

            for(const uPass of user) {
                if(uPass.userPass.dateEnd > new Date()) continue; // Если подписка не закончилась - выходим

                await uPass.updateOne({
                    userPass: null
                })

                const adviceAdministrationChannel = guild.channels.cache.get(channelsId.administrationCouncil);

                adviceAdministrationChannel.send({
                    embeds: [
                        await new EmbedBuilder()
                        .setTitle(`✏️ | Пользовательская подписка`)
                        .setDescription(`**У пользователя <@${uPass.userId}> закончилась пользовательская подписка.**`)
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

module.exports = passTimer;