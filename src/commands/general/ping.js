const {EmbedBuilder, Colors} = require("discord.js");
const os = require('os');
const Punishment = require('../../models/Punishment');
module.exports = {
  name: "ping", // название команды
  descr: "Информация о работоспобности бота.", // описание команды
  showInSlashCommands: true, // показывать ли команду в slash командах
  arguments: [], // аргументы
  perms: (rolesId) => [rolesId.discordMaster, rolesId.juniorDiscordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  async run({bot, interaction, guild}) {
    const createdTimestampDiscordApi = new Date();
    const freeRam = os.freemem() / (1024 * 1024);
    const totalRam = os.totalmem() / (1024 * 1024);
    const ram = (totalRam - freeRam) / 1024;
    const {dateStart} = bot;


    await interaction
        .reply({
          content: `Собираю информацию, ожидайте...`,
        })
    const discordApiPing = new Date() - createdTimestampDiscordApi;
    const createdTimestampMongodb = new Date();
    await Punishment.findOne({});
    const mongodbApiPing = new Date() - createdTimestampMongodb;

    interaction.editReply({
      embeds: [new EmbedBuilder()
          .setTitle(`📌 | Информация`)
          .setDescription(`**Discord Ping: \`${discordApiPing} ms\`\nBot ping: \`${bot.ws.ping} ms\`\nMongodb Ping: \`${mongodbApiPing}ms\`\nRAM: \`${ram.toFixed(2)}MB\`\nПоследний запуск: \`${dateStart.getFullYear()}-${dateStart.getMonth() + 1}-${dateStart.getDate()} ${dateStart.getHours()}:${dateStart.getMinutes()}:${dateStart.getSeconds()}\`\nNode JS Version: \`${process.version}\`\nPlatform system: \`${os.platform()}\`**`)
              .setColor(Colors.DarkGreen)
              .setTimestamp()
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL(),
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL(),
              }),
          ],
        });
  },
};
