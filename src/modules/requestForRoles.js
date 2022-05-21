const {
  rolesId: _rolesId, channelsId: _channelsId, categories: _categories
} = require("../configs/settings");
const getAllRolesIdState = require("../components/getAllRolesIdState");
const { EmbedBuilder, Colors, ActionRowBuilder, ButtonStyle, ButtonBuilder, Collection } = require("discord.js");
const getAllRolesIdAdmins = require("../components/getAllRolesIdAdmins");
const getAllRolesIdModers = require("../components/getAllRolesIdModers");
const parseIdFromMention = require("../components/parseIdFromMention");
const setModerInfoParam = require("../components/setModerInfoParam");
const sendUserMessage = require("../components/sendUserMessage");
const getPlayerGameInfo = require("../components/getPlayerGameInfo");

const getFractionTagAndRoleIdByNickname = (bot, nickname, tags) => {
  for (const tag of Object.keys(tags)) {
    const tagRoleId = tags[tag];
    if (nickname.toLowerCase().includes(`[${tag.toLowerCase()}]`)) {
      return {
        tag, roleId: tagRoleId
      }
    }
    ;
  }
  return null;
}

const log = async (emoji, description, { channelsId, guild, nickname, bot, rolesId }) => {
  const curators = guild.channels.cache.get(channelsId.curators);
  const player = await getPlayerGameInfo(nickname) || { org: null };
  curators.send({
    content: `<@&${rolesId.curatorModeration}>`, embeds: [
      await new EmbedBuilder()
        .setTitle("⛔ | Внимание")
        .setDescription(description)
        .addFields([
          {
            name: `Состоит в организации`, value: `${player.org ? `Да(${player.org})` : "Нет"}`
          }, {
            name: "В игре", value: `${player.isOnline ? `Да` : `Нет`}`
          }
        ])
        .setColor(Colors.DarkRed)
        .setTimestamp()
        .setAuthor({
          name: guild.name, iconURL: guild.iconURL()
        })
        .setFooter({
          text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
        })
    ]
  })
}


// Коллекция с игроками у которых КД запроса ролей. Идёт 30 минут.
const createRequestForRole = new Collection();
setInterval(() => {
  // Каждые 5 секунд перебираем список людей у которых есть действующее КД.
  // Если прошли 30 минут КД, то удаляем человека из списка.
  createRequestForRole.map((
    (dateStart, userId) => {
      const minutes = (
        (
          new Date()
        ).getTime() - (
          new Date(dateStart)
        ).getTime()
      ) / 60000;
      if (minutes >= 30) {
        return createRequestForRole.delete(userId);
      }
    }
  ));
}, 5000);

module.exports = {
  /*
    Описание модуля
    Данный модуль создан для того, чтобы обрабатывать запросы ролей.
  */
  autoRun: false, // автоматический запуск модуля
  name: "requestForRoles", // имя модуля
  acceptCustomsId: ["addRolesRequest", "removeRolesRequest", "addOrRemoveRoleX", "requestGiveRole", "requestDenyRole", "requestCheckRole", "requestDelete", "requestGetStatisticUser"], // модуль автоматически принимает эти айдишники interaction.customId
  async removeRolesRequest({ bot, guild, member, rolesId, interaction }) {
    const allStateRolesId = getAllRolesIdState(rolesId);
    member.roles.remove(allStateRolesId);
    interaction.reply({
      ephemeral: true, embeds: [
        await new EmbedBuilder()
          .setTitle("📌 | Снятие ролей!")
          .setDescription(`**Вы успешно сняли с себя все роли организации!**`)
          .setColor(Colors.DarkGreen)
          .setTimestamp()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  }, async addOrRemoveRoleX({ bot, interaction, member, rolesId, guild }) {
    if (member.roles.cache.has(rolesId.x)) {
      member.roles.remove(rolesId.x);
      return interaction.reply({
        ephemeral: true, embeds: [
          await new EmbedBuilder()
            .setTitle("📌 | Снятие ролей!")
            .setDescription(`**Вы успешно сняли с себя роль <@&${rolesId.x}>!**`)
            .setColor(Colors.DarkGreen)
            .setTimestamp()
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    member.roles.add(rolesId.x);
    return interaction.reply({
      ephemeral: true, embeds: [
        await new EmbedBuilder()
          .setTitle("📌 | Выдача ролей!")
          .setDescription(`**Вы успешно выдали себе роль <@&${rolesId.x}>!**`)
          .setColor(Colors.DarkGreen)
          .setTimestamp()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  },
  async addRolesRequest({ interaction, bot, member, rolesId, guild, channelsId }) {
    if (createRequestForRole.has(member.id)) {
      // Количество секунд через сколько можно будет написать новый тикет.
      const dateEnd = new Date(createRequestForRole.get(member.id));
      const minutes = Math.round((
        dateEnd - new Date()
      ) / 60000);

      return interaction.reply({
        ephemeral: true, embeds: [
          new EmbedBuilder()
            .setTitle(`⏳ | Стой-стой!`)
            .setDescription(`**Полегче друг, у тебя действует интервал на запрос ролей. По новой запросить роль ты сможешь через \`${minutes}\` минут(у)**`)
            .setColor(Colors.Red)
            .setTimestamp()
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
    // Список ролей имея которые нельзя запрашивать роль.
    const allRolesState = [
      // Министры
      rolesId.ministers, // Лидеры
      rolesId.leadersFractions, // Заместители
      rolesId.deputiesFractions, // Все роли гос.организации
      ...getAllRolesIdState(rolesId), // Все админские роли
      ...getAllRolesIdAdmins(rolesId)
    ];
    // Если у пользователя есть одна из ролей, то отдаём ему ошибку.
    if (member.roles.cache.find(role => allRolesState.includes(role.id))) {
      const dontAllowRole = member.roles.cache.find(role => allRolesState.includes(role.id))
      return interaction.reply({
        ephemeral: true, embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**Вам запрещено запрашивать роль организации, так как у Вас имеется роль ${dontAllowRole}. Для начала снимите её, а потом повторите попытку.**`)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setColor(Colors.Red)
        ]
      })
    }

    // Выражение для проверки тега. Валиден только [tag][rank] Nick_Name.
    const regex = /\[(?:\w+|[а-яё]+)\]\[\d+\]/mig;
    // Проверяем, валидна ли у человека форма тега.
    const nickname = member.displayName.split("").filter(simbol => simbol !== " ").join("");
    if (!regex.test(nickname)) {
      return interaction.reply({
        ephemeral: true, embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**У Вас указана невалидная форма. Форма: \`[Фракция][ранг] Имя_Фамилия\`**`)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setColor(Colors.Red)
        ]
      })
    }

    // Проверяем, есть ли у человека тег по какую-то роль
    const tags = bot.tagsFractions(rolesId);
    const tagInfo = getFractionTagAndRoleIdByNickname(bot, nickname, tags);
    if (!tagInfo) {
      return interaction.reply({
        ephemeral: true, embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**На Ваш тег не нашлось определённой роли! Перепроверьте Ваш тег с тегом в канале <#${channelsId.tagsFractions}>**`)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setColor(Colors.Red)
        ]
      })
    }

    const channelRequestsRoles = guild.channels.cache.get(channelsId.requestsForGiveRole);
    await channelRequestsRoles.send({
      content: `<@&${rolesId.juniorModerator}>`,
      embeds: [
        new EmbedBuilder()
          .setTitle("📨 | Новый запрос роли!")
          .addFields([
            {
              name: `Пользователь`, value: `<@${interaction.member.id}>`, inline: true
            }, {
              name: `Никнейм`, value: `\`${interaction.member.displayName}\``, inline: true
            }, {
              name: `Роль для выдачи`, value: `<@&${tagInfo.roleId}>`, inline: true
            }, {
              name: `Отправлено с канала`, value: `<#${interaction.channel.id}>`, inline: true
            }, {
              name: `Информация по выдаче`,
              value: `\`[✅] - выдать роль\`\n\`[❌] - отказать в выдачи роли\`\n\`[⚙️] - проверить организацию\`\n\`[👁️] - запросить статистику у игрока\`\n\`[🗑️] - удалить сообщение\``,
              inline: true
            }
          ])
          .setColor(Colors.Red)
          .setTimestamp()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ], components: [
        new ActionRowBuilder()
          .addComponents([
            new ButtonBuilder()
              .setStyle(ButtonStyle.Success)
              .setCustomId(`requestGiveRole`)
              .setEmoji({
                name: `✅`
              }), new ButtonBuilder()
              .setStyle(ButtonStyle.Danger)
              .setCustomId(`requestDenyRole`)
              .setEmoji({
                name: `⛔`
              }), new ButtonBuilder()
              .setStyle(ButtonStyle.Secondary)
              .setCustomId(`requestCheckRole`)
              .setEmoji({
                name: `⚙`
              }), new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setCustomId("requestGetStatisticUser")
              .setEmoji({
                name: `👁️`
              }), new ButtonBuilder()
              .setStyle(ButtonStyle.Primary)
              .setCustomId(`requestDelete`)
              .setEmoji({
                name: `🗑️`
              })
          ])
      ]
    })

    interaction.reply({
      ephemeral: true, embeds: [
        new EmbedBuilder()
          .setTitle("📨 | Новый запрос роли!")
          .setColor(Colors.DarkGreen)
          .setTimestamp()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
          .setDescription(`**Ваш запрос на выдачу роли <@&${tagInfo.roleId}> был успешно отправлен! Ожидайте выдачи от модераторов!**`)
      ]
    })

    const dateEnd = new Date();
    dateEnd.setMinutes(dateEnd.getMinutes() + 30);
    createRequestForRole.set(member.id, dateEnd);
  },

  async requestGiveRole({ interaction, guild, rolesId, member, channelsId, bot }) {
    const { message } = interaction;
    const userId = parseIdFromMention(message.embeds[0].data.fields[0].value);
    let userForGiveRole = guild.members.cache.get(userId);

    // По полям в эмбеде проверяем проверялась ли дополнительно информация об игроке
    // на факт состояния в организации. Если нет, то сообщаем об этом в кураторскую.
    if (message.embeds[0].fields.length <= 5) {
      await log(`⛔`, `**Модератор ${member}(${member.id}) выдал роль игроку ${userForGiveRole}(${userForGiveRole.id}) не проверив его через кнопку! Ниже предоставлена информация об игроке**`, {
        channelsId, nickname: message.embeds[0].fields[1].value.split("]")[2].trim(), rolesId, guild, bot
      });
    }

    if (message.embeds[0].fields[5]?.value.includes("Не состоит в организации")) {
      await log(`⛔`, `**Модератор ${member}(${member.id}) выдал роль игроку ${userForGiveRole}(${userForGiveRole.id}) который не находиться в организации по информации сайта! Ниже предоставлена информация об игроке**`, {
        channelsId, nickname: message.embeds[0].fields[1].value.split("]")[2].trim(), rolesId, guild, bot
      });
    }

    // Прежде чем выдать основную роль гос.организации - снимаем все остальные
    // чтобы не произошёл парадокс с 2мя и более ролями гос.организации.
    await userForGiveRole.roles.remove(getAllRolesIdState(rolesId));

    // Роль которую мы будем выдавать
    const roleId = parseIdFromMention(message.embeds[0].fields[2].value);

    // Выдаем необходимую роль + роль сотрудник гос.организации
    await userForGiveRole.roles.add([roleId, rolesId.stateEmployee]);
    message.delete();
    interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`✅ | Одобрение`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`<@${member.id}> (${member.id}) одобрил запрос от ${userForGiveRole} (${userForGiveRole.id})`)
          .setColor(Colors.DarkGreen)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
          .addFields([
            {
              name: `Роль для выдачи`, value: `<@&${roleId}>`
            }, {
              name: `Никнейм пользователя`, value: `${userForGiveRole.displayName}`
            }
          ])
      ]
    });
    await sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setTitle(`✅ | Одобрение`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`Модератор ${member} (${member.displayName}) одобрил Ваш запрос на выдачу роли!.`)
          .setColor(Colors.DarkGreen)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    }, userForGiveRole.id, guild);
  },
  async requestDenyRole({ bot, interaction, guild, member, channelsId, rolesId }) {
    const { message } = interaction;
    const userId = parseIdFromMention(message.embeds[0].data.fields[0].value);
    let userForDenyRole = guild.members.cache.get(userId);
    const roleId = parseIdFromMention(message.embeds[0].fields[2].value);

    if (message.embeds[0].fields.length <= 5) {
      log(`⛔`, `**Модератор ${member}(${member.id}) отказал запрос на выдачу роли игроку ${userForDenyRole}(${userForDenyRole.id}) не проверив его через кнопку! Ниже предоставлена информация об игроке**`, {
        channelsId, nickname: message.embeds[0].fields[1].value.split("]")[2].trim(), rolesId, guild, bot
      });
    }
    await interaction.reply({
      ephemeral: true, embeds: [
        new EmbedBuilder()
          .setTitle(`⛔ | Отклонение`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`Укажите причину отклонения запроса на выдачу роли пользователю ${userForDenyRole}. У Вас одна минута!`)
          .setColor(Colors.DarkRed)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    });
    const messages = await interaction.channel.awaitMessages({
      filter: (message) => message.author.id === member.id, max: 1, time: 60000
    });
    if (!messages.size) {
      return;
    }
    const reasonMessage = messages.first();
    const reason = reasonMessage.content;
    await reasonMessage.delete();
    interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`⛔ | Отклонение`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`<@${member.id}> (${member.id}) отклонил запрос от ${userForDenyRole} (${userForDenyRole.id})`)
          .addFields([
            {
              name: `Роль для выдачи`,
              value: `<@&${roleId}>`
            }, {
              name: `Никнейм пользователя`,
              value: `${userForDenyRole.displayName}`
            }, {
              name: `Причина`,
              value: `${reason}`
            }
          ])
          .setColor(Colors.DarkRed)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    });
    await sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setTitle(`⛔ | Отклонение`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`Модератор <@${member.id}>(${member.displayName}) отклонил Ваш запрос на выдачу роли. Причина: \`${reason}\``)
          .setColor(Colors.DarkRed)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    }, userForDenyRole.id, guild);
    interaction.message.delete();
  },
  async requestCheckRole({ interaction, bot, guild, member }) {
    const date = new Date();
    const oldEmbed = interaction.message.embeds[0];
    interaction.reply({
      ephemeral: false, content: `${member}`, embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`⌛ | Загрузка данных...`)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setDescription(`**Происходит процесс загрузки данных.\nВ среднем загрузка данных длится около 3-10 секунд.\nПока идёт загрузка можете сыграть в гляделки с одним из наших котиков.**`)
          .setTimestamp()
          .setImage("https://www.cats-british.ru/files/articles/pochemu_koshka_smotrit_v_glaza.jpg")
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    });
    const player = await getPlayerGameInfo(oldEmbed.fields[1].value.split("]")[2].trim()) || {
      isOnline: false, org: null
    };
    interaction.message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(oldEmbed.title)
          .setColor(oldEmbed.color)
          .setAuthor(oldEmbed.author)
          .setFooter(oldEmbed.footer)
          .setTimestamp()
          .addFields([
            ...oldEmbed.fields.slice(0, 4),
            {
              name: `Статус`,
              value: `${player.org ? `Состоит в организации(${player.org})` : "Не состоит в организации"}`,
              inline: false
            },
            {
              name: `В игре`,
              value: `${player.isOnline ? "Да" : "Нет"}`, inline: true
            },
            {
              name: `Последнее обновление`,
              value: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            }
          ])
      ]
    });
    interaction.deleteReply();
  },

  async requestDelete({ bot, interaction, guild, member }) {
    const { message } = interaction;
    const userId = parseIdFromMention(message.embeds[0].data.fields[0].value);
    let userForDenyRole = guild.members.cache.get(userId);

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🗑️ | Удаление`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`Укажите причину удаления запроса на выдачу роли пользователю ${userForDenyRole}. У Вас одна минута!`)
          .setColor(Colors.DarkBlue)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ], ephemeral: true
    });
    const messages = await interaction.channel.awaitMessages({
      filter: (message) => message.author.id === member.id, max: 1, time: 60000
    });
    if (!messages.size) {
      return;
    }
    const reasonMessage = messages.first();
    const reason = reasonMessage.content;
    await reasonMessage.delete();
    const roleId = parseIdFromMention(message.embeds[0].fields[2].value);
    interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🗑️ | Удаление`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`<@${member.id}> (${member.id}) удалил запрос от ${userForDenyRole}(${userForDenyRole.id}).`)
          .addFields([
            {
              name: `Роль для выдачи`,
              value: `<@&${roleId}>`
            }, {
              name: `Никнейм пользователя`,
              value: `${userForDenyRole.displayName}`
            }, {
              name: `Причина`,
              value: `${reason}`
            }
          ])
          .setColor(Colors.DarkBlue)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    });
    await sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🗑️ | Удаление`)
          .setAuthor({ name: member.displayName, iconURL: member.user.displayAvatarURL() })
          .setDescription(`Модератор <@${member.id}> удалил Ваш запрос на выдачу роли. Причина: \`${reason}\``)
          .setColor(Colors.DarkBlue)
          .setTimestamp()
          .setFooter({ text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL() })
      ]
    }, userForDenyRole.id, guild);
    interaction.message.delete();
  },

  async requestGetStatisticUser({ bot, interaction, member, guild }) {
    const { message } = interaction;
    const oldEmbed = message.embeds[0];
    if (oldEmbed.fields.find(field => field.value.includes(`У игрока была запрошена статистика модератором`))) {
      return interaction.reply({
        ephemeral: true, embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**У данного игрока уже запрошена статистика!**`)
            .setAuthor({
              name: guild.name, iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
            })
            .setColor(Colors.Red)
        ]
      })
    }
    const userId = parseIdFromMention(oldEmbed.fields[0].value);
    message.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle(oldEmbed.title)
          .setColor(oldEmbed.color)
          .setAuthor(oldEmbed.author)
          .setFooter(oldEmbed.footer)
          .setTimestamp()
          .addFields([
            ...oldEmbed.fields, {
              name: `Важно!`, value: `У игрока была запрошена статистика модератором \`${member.displayName}\``
            }
          ])
      ]
    });
    await sendUserMessage({
      embeds: [
        new EmbedBuilder()
          .setTitle("📨 | Запрос роли!")
          .setTimestamp()
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
          .setColor(Colors.Red)
          .setDescription(`**Привет!\n Ты не так давно запрашивал роль в организацию!\n Так вот, модератору для проверки того есть ли ты в организации нужна твоя статистика!\n Сделай скриншот статистики через команду \`/stats\`.\n Как только введёшь эту команду и откроется меню со статистикой - введи команду \`/time\` и нажми на кнопку F8.\n После этого у тебя по пути \`C:\\Users\\[имя пользователя]\\Documents\\GTA San Andreas User Files\\SAMP\\screens\` появиться файл \`sa-mp-номер.png\`.\n Отправь этот файл в этот чат модератору и тебе выдадут роль!**`)
      ]
    }, userId, guild);
    interaction.reply({
      ephemeral: true, embeds: [
        new EmbedBuilder()
          .setTitle("📨 | Сообщение отправлено!")
          .setColor(Colors.Red)
          .setTimestamp()
          .setDescription(`**Пользователю <@${userId}> было отправлено сообщение об просьбе отправить Вам в личные сообщения статистику игрока! Не забудьте открыть личные сообщения если они закрыты!чы **`)
          .setAuthor({
            name: guild.name, iconURL: guild.iconURL()
          })
          .setFooter({
            text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
          })
      ]
    })
  },


  async run({ interaction, bot }) {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
    const guild = bot.guilds.cache.get(interaction.guildId);
    const member = interaction.member;
    const rolesId = _rolesId[guild.id];
    const channelsId = _channelsId[guild.id];
    const categoriesId = _categories[guild.id];
    // Права к кнопкам в канале request-for-roles.
    const perms = getAllRolesIdModers(rolesId);
    const actions = [
      {
        customId: "removeRolesRequest", func: this.removeRolesRequest
      }, {
        customId: "addOrRemoveRoleX", func: this.addOrRemoveRoleX
      }, {
        customId: "addRolesRequest", func: this.addRolesRequest
      }, {
        customId: `requestGiveRole`, func: this.requestGiveRole, perms
      }, {
        customId: `requestDenyRole`, func: this.requestDenyRole, perms
      }, {
        customId: `requestCheckRole`, func: this.requestCheckRole, perms
      }, {
        customId: `requestDelete`, func: this.requestDelete, perms
      }, {
        customId: `requestGetStatisticUser`, func: this.requestGetStatisticUser, perms
      }
    ]

    const action = actions.find(action => action.customId === interaction.customId);
    if (action.perms?.length) {
      const rolePerm = action.perms.find(roleId => member.roles.cache.has(roleId));
      if (!rolePerm) {
        return interaction.reply({
          ephemeral: true, embeds: [
            new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(`**Не достаточно прав!**`)
              .setAuthor({
                name: guild.name, iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
              })
              .setColor(Colors.Red)
          ]
        })
      }
    }
    if (action) {
      await action.func({
        bot, guild, member, rolesId, channelsId, categoriesId, interaction
      });

      // Все кастомные айдишники за которые пополняется параметр `roles` в статистике модератора.
      const customIdUpdatesRolesParam = ["requestGiveRole", "requestDenyRole", "requestGetStatisticUser", "requestDelete"];
      if (customIdUpdatesRolesParam.includes(interaction.customId)) {
        await setModerInfoParam(member.id, guild.id, 'main', 'roles', ({ roles }) => roles + 1)
        await setModerInfoParam(member.id, guild.id, 'week', 'roles', ({ roles }) => roles + 1)
        const balls = ({ coefficient, balls, rates }) => balls + coefficient * rates.role;
        await setModerInfoParam(member.id, guild.id, 'main', 'balls', balls)
        await setModerInfoParam(member.id, guild.id, 'week', 'balls', balls)
      }
    }
  }
};
