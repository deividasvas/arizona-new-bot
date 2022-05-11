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
    archive: true,
    // archive: true
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

    async run({bot, guild, channelsId, args, interaction}) {
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
                        `**Происходит процесс загрузки данных.\nВ среднем загрузка данных длится около 3-10 секунд.\nМожете пойти выпить кофе.**`
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
        if (player.message) {
            return interaction.editReply({
                embeds: [
                    await new EmbedBuilder()
                        .setTitle(`❌ | Ошибка!`)
                        .setDescription(
                            `**Произошла ошибка. Текст ошибки: \`${player.message}\`**`
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
            embeds: [
                new EmbedBuilder()
                    .setAuthor({name: guild.name, iconURL: guild.iconURL()})
                    .setTitle(`Информация о пользователе - ${nickname}`)
                    .setDescription(`\`\`\`asciidoc\n= Аккаунт =\`\`\`\n>>> **「💾」Никнейм: \`${nickname}\`\n「💎」Статус: \`${!player.isOnline ? "Не в сети" : "В игре"}\`\n「💰」Баланс: \`${player.cash}\`\n「🏦」Баланс в банке: \`${player.bank}\`\n「💶」Баланс депозита: \`${player.deposit}\`\n「👻」Уровень: \`${player.lvl}\`\n「🔰」VIP: \`${player.vip}\`\n「🛠」Работа: \`${player.work}\`\n「📕」Организация: \`${player.org ? player.org : "Отсутствует"}\`\n${player.rank ? `「💳」Ранг: \`${player.rank}\`` : ""}**`)
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
