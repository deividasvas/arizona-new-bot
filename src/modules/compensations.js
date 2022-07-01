const {EmbedBuilder, Colors} = require("discord.js");
const parseIdFromMention = require("../components/parseIdFromMention");
const setUserCoinsParam = require("../components/setUserCoinsParam");
const sendUserMessage = require("../components/sendUserMessage");
const {getGuildChannelsId} = require("../configs/settings");
const log = require('../components/log');

const compensationsOptions = [
    {
        label: "2 монеты и 2 уровня",
        value: `{ "type": "moneyAndLvl", "level": 2, "money": 2 }`,
    },
    {
        label: "3 монеты и 3 уровня",
        value: `{ "type": "moneyAndLvl", "level": 3, "money": 3 }`,
    },
    {
        label: "4 монеты и 4 уровня",
        value: `{ "type": "moneyAndLvl", "level": 4, "money": 4 }`,
    },
    {
        label: "6 монет и 6 уровней",
        value: `{ "type": "moneyAndLvl", "level": 6, "money": 6 }`,
    },
    {
        label: "9 монет и 9 уровней",
        value: `{ "type": "moneyAndLvl", "level": 9, "money": 9 }`,
    },
    {
        label: "12 монет и 12 уровней",
        value: `{ "type": "moneyAndLvl", "level": 12, "money": 12 }`,
    },
    {
        label: "Иммунитет от кика",
        value: `{ "type": "immunityKick" }`,
    },
    {
        label: "Иммунитет от мута",
        value: `{ "type": "immunityMute" }`,
    },
    {
        label: "Иммунитет от бана 5 дней",
        value: `{ "type": "immunityBan5" }`,
    },
];

module.exports = {
    compensationsOptions,
    /*
      Описание модуля
      Данный модуль создан для того, чтобы обрабатывать выдачу компенсации при помощи команды give-compensation.js
    */
    name: "compensations", // имя модуля
    autoRun: false,
    acceptCustomsId: ["select-compensation"], // модуль автоматически принимает эти айдишники interaction.customId
    getCompensationObject(obj) {
        if (obj.type === 'moneyAndLvl') {
            return obj;
        }

        if (obj.type === 'immunityKick' || obj.type === 'immunityMute') {
            return {
                type: obj.type
            }
        }

        if (obj.type === 'immunityBan5') {
            return {
                type: obj.type,
                timeType: 'days',
                timeValue: 5,
            }
        }

        return obj;
    },
    async run({bot, interaction}) {
        // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
        const { user: moderatorUser } = interaction.message.interaction;
        const { guild, message } = interaction;
        const member = guild.members.cache.get(moderatorUser.id);
        // Получаем айди пользователя которому нужно выдать компенсацию.
        const userId = parseIdFromMention(message.embeds[0].description);
        const userMember = guild.members.cache.get(userId);
        // Компенсация которую нужно выдать
        const { label, value: _value } = compensationsOptions.find(option => option.value === interaction.values[0])
        const value = JSON.parse(_value);
        // console.log(interaction);

        await setUserCoinsParam(userId, interaction.guildId, 'compensations', ({compensations}) => {
            return [...compensations, {
                ...this.getCompensationObject(value),
                userGiveId: member.id,
                label,
            }];
        });

        interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(
                        `✅ | Выдача компенсации`
                    )
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Пользователю <@${userId}> успешно была выдана компенсация \`${label}\`**`
                    )
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ],
            components: []
        });

        await sendUserMessage({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(
                        `🤑 | Выдача компенсации`
                    )
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Вам была выдана компенсация в виде \`${label}\` на сервере \`${guild.name}\`.\nВыдал модератор: ${moderatorUser} (${moderatorUser.tag})**`
                    )
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ]
        }, userId, guild)


        const channelsId = getGuildChannelsId(guild.id);
        const moderationLog = guild.channels.cache.get(channelsId.moderationLog);
        moderationLog.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Blue)
                    .setTitle(
                        `🤑 | Выдача компенсации`
                    )
                    .setAuthor({
                        name: guild.name,
                        iconURL: guild.iconURL(),
                    })
                    .setDescription(
                        `**Модератор <@${member.id}> выдал пользователю <@${userId}> компенсацию в виде \`${label}\`!**`
                    )
                    .setFooter({
                        text: `Robo Hamster`,
                        iconURL: bot.user.displayAvatarURL(),
                    }),
            ]
        })

        log(41, {
            moderatorId: member.id,
            moderatorTag: member.tag,
            moderatorNick: member.displayName,
            discordId: userMember.id,
            discordTag: userMember.tag,
            discordNick: userMember.displayName,
            value: label,
        })
    }
};