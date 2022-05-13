const Tickets = require('../models/Tickets');
const createTicket = require("./createTicket");
// Функция возвращает тикет.
const getTicket = async (guildId, channelId, authorId) => {
    const ticket = await Tickets.findOne({
        guildId,
        channelId,
    });
    if (!ticket) {
        const newTicketId = await Tickets.find({}).sort({$natural: -1}).limit(1)[0]?.ticketId + 1 || 1;
        return await createTicket(newTicketId, guildId, authorId, new Date(), new Date(), "0", "", channelId);
    }
    return ticket;
}

module.exports = getTicket;