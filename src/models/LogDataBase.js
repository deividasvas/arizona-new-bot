const mongoose = require("mongoose");

// Коллекция в которой хранятся логи пользователей.
const LogDataBase = new mongoose.Schema({
    guildId: String,
    discordId: {
        type: String,
        default: 'Не указано'
    },
    discordTag: {
        type: String,
        default: 'Не указано'
    },
    discordNick: {
        type: String,
        default: 'Не указано'
    },
    moderatorId: {
        type: String,
        default: 'Не указано'
    },
    moderatorTag: {
        type: String,
        default: 'Не указано'
    },
    moderatorNick: {
        type: String,
        default: 'Не указано'
    },
    actionId: Number,
    actionName: String,
    time: {
        type: Date,
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