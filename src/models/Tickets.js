const { default: mongoose } = require("mongoose");

// Коллекция в которой хранятся тикеты.
const Tickets = new mongoose.Schema({
    ticketId: Number,
    guildId: Number,
    authorId: String,
    created: Date,
    closed: Date,
    moderatorId: String,
    rating: String,
    channelId: String,
    status: Number,
});

module.exports = new mongoose.model("tickets", Tickets) // коллекция с тикетами