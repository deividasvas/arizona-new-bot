const { EmbedBuilder } = require("discord.js");
const { channelsId } = require("../configs/settings");
const Punishment = require("../models/Punishment");

const unban = async (bot, userId, provocateur) => {
    const punish = await Punishment.findOne({
       action: 'ban',
       userId 
    });
    console.log(punish, userId, "964160320765571104");
    if(!punish){
        return;
    }
    const guild = bot.guild.cache.get(punish.guildId);
    punish.remove();
    await guild.members.unban(userId, `Система снятия блокировки by System`);
}

module.exports = unban;