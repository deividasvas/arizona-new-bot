const {
    EmbedBuilder,
    Colors, ApplicationCommandOptionType,
} = require("discord.js");
const Captcha = require('2captcha');
const axios = require("axios");
const getAllRolesIdAdmins = require("../../components/getAllRolesIdAdmins");
const getAllRolesIdModers = require("../../components/getAllRolesIdModers");

// const getRecaptchaToken = () => solver.recaptcha("6LdLWdMaAAAAAJI4L3Dp3iV7eB7qerf8p-YyzLoD", "https://arizona-rp.com").then(req => req.data)
//
// const solver = new Captcha.Solver("8442257b4f52799ef9f2f7cce5caaf91");
// const getPlayerToken = async () => axios.post(`https://backend.arizona-rp.com/auth/by-password`, {
//     username: "Andrey_Connect",
//     password: "123123123",
//     serverId: 1,
//     recaptchaToken: await getRecaptchaToken(),
// }).then(req => req.data.accessToken);

module.exports = {
    name: "find", // название команды
    descr: "Найти базовую статистику игрока по его никнейму", // описание команды
    archive: false,
    perms: (rolesId) => [
        ...getAllRolesIdAdmins(rolesId),
        ...getAllRolesIdModers(rolesId),
    ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
    showInSlashCommands: false, // показывать ли команду в slash командах
    arguments: [
        {
            name: "никнейм",
            description: "Никнейм игрока по которому Вы хотите получить информацию",
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ], // аргументы

    async run({bot, guild, rolesId, args, interaction}) {
        const nickname = args[0];

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.DarkGreen)
                    .setTitle(`⌛ | Загрузка данных...`)
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Происходит процесс загрузки данных.\nВ среднем загрузка данных длится около 3-10 секунд.\nПока идёт загрузка можете сыграть в гляделки с одним из наших котиков.**`
                    )
                    .setTimestamp()
                    .setImage("https://www.cats-british.ru/files/articles/pochemu_koshka_smotrit_v_glaza.jpg")
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
        });
        const request = await axios.get(`https://arizona-rp-api.herokuapp.com/api/find-player?nickname=${nickname}`, {
            headers: {
                token: "ArizonaSurprise10TopTheBotWrittingByDeividBrown"
            },
            validateStatus: () => true,
        })
        if (request.data.errors?.length) {
            return interaction.editReply({
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**${request.data.errors[0]}**`
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
        const { isOnline, cash, bank, org, vip, work, rank, deposit, lvl, totalMoney } = (request.data).data;
        const format = (number) => new Intl.NumberFormat('en-US').format(number)
        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setAuthor({name: guild.name, iconURL: guild.iconURL()})
                    .setTitle(`Информация о пользователе - ${nickname}`)
                    .setDescription(`\`\`\`asciidoc\n= Аккаунт =\`\`\`\n>>> **「💾」Никнейм: \`${nickname}\`\n「💎」Статус: \`${!isOnline ? "Не в сети" : "В игре"}\`\n「💰」Баланс: \`${format(cash)}\`\n「🏦」Баланс в банке: \`${format(bank)}\`\n「💶」Баланс депозита: \`${format(deposit)}\`\n「🤑」Общее количество денег: \`${format(totalMoney)}\`\n「👻」Уровень: \`${lvl}\`\n「🔰」VIP: \`${vip}\`\n「🛠」Работа: \`${work}\`\n「📕」Организация: \`${org ? org : "Отсутствует"}\`\n${rank ? `「💳」Ранг: \`${rank}\`` : ""}**`)
                    // .setColor(Colors.Red)
                    .setColor(Colors.Red)
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    })
            ]
        })
    }
};
