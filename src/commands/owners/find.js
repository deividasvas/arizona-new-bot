const {
    EmbedBuilder,
    Colors, ApplicationCommandOptionType,
} = require("discord.js");
const Captcha = require('2captcha');
const axios = require("axios");

// const getRecaptchaToken = () => solver.recaptcha("6LdLWdMaAAAAAJI4L3Dp3iV7eB7qerf8p-YyzLoD", "https://arizona-rp.com").then(req => req.data)
//
// const solver = new Captcha.Solver("8442257b4f52799ef9f2f7cce5caaf91");
// const getPlayerToken = async () => axios.post(`https://backend.arizona-rp.com/auth/by-password`, {
//     username: "Andrey_Connect",
//     password: "123123123",
//     serverId: 1,
//     recaptchaToken: await getRecaptchaToken(),
// }).then(req => req.data.accessToken);

// const getPlayer = async (nickname, serverId = 10) => {
//     const request = await axios.post(`https://backend.arizona-rp.com/gamer/find`, {
//         recaptchaToken: await getRecaptchaToken(),
//         serverId,
//         username: nickname
//     }, {
//         validateStatus: () => true,
//         headers: {
//             Authorization: `Bearer ${await getPlayerToken()}`,
//             Accept: "application/json, text/plain, */*",
//             "Accept-Encoding": "gzip, deflate, br",
//             "Accept-Language": "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
//             "Connection": "keep-alive",
//             "Host": "backend.arizona-rp.com",
//             Origin: "https://arizona-rp.com",
//             Referer: "https://arizona-rp.com/",
//             "Sec-Fetch-Dest": "empty",
//             "Sec-Fetch-Mode": "cors",
//             "Sec-Fetch-Site": "same-site",
//             TE: "trailers",
//             "User-Agent": `Mozilla / 5.0(Macintosh; Intel Mac OS X 10.15; rv: 100.0) Gecko / 20100101 Firefox / 100.0`,
//         }
//     })
//     return request.data;
// }


/*

    КОМАНДА НУЖДАЕТСЯ В ДОРАБОТКЕ!!!!!
    ТЕКУЩАЯ РАБОТА КОМАНДЫ НЕСТАБИЛЬНА!!!!!
 */

module.exports = {
    name: "find", // название команды
    descr: "Найти базовую статистику игрока по его никнейму", // описание команды
    archive: true,
    perms: (rolesId) => [rolesId.discordMaster], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "никнейм",
            description: "Никнейм игрока по которому Вы хотите получить информацию",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ], // аргументы

    async run({bot, guild, channelsId, args, interaction}) {
        const nickname = args[0];

        interaction.reply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`⌛ | Загрузка данных...`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Происходит процесс загрузки данных.\nВ среднем загрузка данных длится около 20-30 секунд.\nМожете пойти выпить кофе.**`
                    )
                    .setTimestamp()
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
        const player = await getPlayer(nickname);
        console.log(player);
        if (player.status !== 1) {
            return interaction.editReply({
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Произошла ошибка. Текст ошибки: \`${player[0]?.message || player.message}\`**`
                        )
                        .setColor(Colors.Red)
                        .setAuthor({
                            name: guild.name,
                            iconURL: guild.iconURL(),
                        })
                        .setFooter({
                            text: `Robo Hamster`,
                            iconURL: bot.user.displayAvatarURL(),
                        })
                ]
            })
        }
        interaction.editReply({
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setAuthor({name: guild.name, iconURL: guild.iconURL()})
                    .setTitle(`Информация о пользователе - ${nickname}`)
                    .setDescription(`\`\`\`asciidoc\n= Аккаунт =\`\`\`\n>>> **「💾」Никнейм: \`${nickname}[${player.isOnline === 1001 ? "-1" : player.isOnline}]\`\n「💎」Статус: \`${player.isOnline === 1001 ? "Не в сети" : "В игре"}\`\n「💰」Баланс: \`${player.cash}\`\n「🏦」Баланс в банке: \`${player.bank}\`\n「💶」Баланс депозита: \`${player.deposit}\`\n「👻」Уровень: \`${player.level}\`\n「🔰」VIP: \`${player.vipName}[${player.vipLevel}]\`\n「💸」Номер телефона: \`${player.phoneNumber}\`\n「🛠」Работа: \`${player.jobName}[${player.job}]\`\n「📕」Организация: \`${player.orgName}[${player.fraction}]\`\n${player.orgName !== 'Отсутствует' ? `「💳」Должность: \`${player.rank}\`` : ""}**`)
                    // .setColor(Colors.Red)
                    .setColor(Colors.Purple)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    }
};
