const { default: mongoose } = require("mongoose");
// Коллекция голосов за баны в команде /mban.
const BansVotesSchema = new mongoose.Schema({ 
  moderatorSenderId: String, // айди модератора
  userForBanId: String, // айди юзера которого банят
  days: Number, // количество дней бана
  reason: String, // причина бана
  agrees: [String], // айдишники принявших бан
  denies: [String], // айдишники отказавших бан
});

module.exports = mongoose.model("bansvotes", BansVotesSchema);
