// Функция создаёт и сохраняет тикет в базу данных.
const Tickets = require("../models/Tickets");
const createTicket = async (ticketId, guildId, authorId, created, closed, moderatorId, rating, channelId) => {
    const newTicket = new Tickets({
        ticketId,
        guildId,
        authorId,
        created,
        closed,
        moderatorId,
        rating,
        channelId,
        status: 1,
    });
    // Сохраняем информацию о тикете в базу данных.
    await newTicket.save();
    return newTicket;
}

module.exports = createTicket;