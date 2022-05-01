// Функция, которая возвращает действие по числу.
const mongoose = require("mongoose");

const LogDataBase = new mongoose.Schema({
    guildId: String,
    discordId: String,
    discordTag: String,
    discordNick: String,
    moderatorId: String,
    moderatorTag: String,
    moderatorNick: String,
    action: {
        type: String,
        default: "0"
    },
    time: {
        type: Date,
    },
    nameRole: {
        type: String,
        default: 'Не указано',
    },
    reason: {
        type: String,
        default: 'Не указано',
    },
    ticket: {
        type: String,
        default: 'Не указано',
    },
    typeStats: {
        type: String,
        default: 'Не указано',
    },
    roleId: {
        type: String,
        default: 'Не указано',
    },
    roleName: {
        type: String,
        default: 'Не указано',
    },
    channelId: {
        type: String,
        default: 'Не указано',
    },
    channelName: {
        type: String,
        default: 'Не указано',
    },
    value: {
        type: String,
        default: 'Не указано',
    },
})

module.exports = mongoose.model("logs", LogDataBase);