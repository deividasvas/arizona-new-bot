const { EmbedBuilder, Colors } = require("discord.js");
const getModerInfo = require("../components/getModerInfo");
const setModerInfoParam = require("../components/setModerInfoParam");
const setWarnsOrRebukes = require("../components/setWarnsOrRebukes");
const {
  rolesId,
  channelsId,
  maxCountImmunities,
} = require("../configs/settings");

module.exports = {
  /*
    Описание модуля
    Данный модуль нужен для обработки кнопок команды bshop
  */
  name: "bshop", // имя модуля
  acceptCustomsId: [
    "bshop_minus_rebuke",
    "bshop_10level",
    "bshop_20level",
    "bshop_30level",
    "bshop_imun",
    "bshop_x2balls",
    "bshop_x3balls",
    "bshop_role",
  ], // модуль автоматически принимает эти айдишники interaction.customId
  run: async ({ bot, interaction, user, guild: _guild, message }) => {
    // команда запуска. Автоматически запускается если находится айди в interactionCreate из списка выше
    const { customId } = interaction;
    const { main, error, warns, week, guildId } = await getModerInfo(
      bot,
      _guild?.id,
      user.id
    );
    const guild = bot.guilds.cache.get(guildId); // получаем дискорд сервер по айдишнику из статистики модератора
    if (error === "THE_NOT_MODERATOR") {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не являетесь модератором. Если это не так, то обратитесь к технической поддержке Вашего сервера**`
            )
            .setColor(Colors.Red)
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
    }

    const { balls } = main;
    const services = [
      {
        name: `Снятие выговора`, // название услуги (с большой буквы)
        customId: "bshop_minus_rebuke", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 100, // необходимое количество баллов для покупки услуги
        filter({ warns }) {
          const rebukes = warns.filter(
            (warnOrRebuke) => warnOrRebuke.group === "rebuke"
          );
          if (!rebukes.length) {
            return {
              error: true,
              text: `У Вас нет выговоров`,
              status: `ERR`,
            };
          }
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          setWarnsOrRebukes(user.id, guild.id, ({ warns }) => {
            const rebukes = warns.filter(
              (warnOrRebuke) => warnOrRebuke.group === "rebuke"
            );
            const preds = warns.filter(
              (warnOrRebuke) => warnOrRebuke.group === "warn"
            );
            return [...rebukes.slice(0, rebukes.length - 1), ...preds];
          });
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          const punishModeratorsLog = guild.channels.cache.get(
            channelsId.punishModeratorsLog
          );
          punishModeratorsLog.send({
            content: `${user}`,
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Снятие выговора`)
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setDescription(
                  `**「📝」Кто снял: <@${user.id}>\n「📕」Причина: \`Покупка за баллы\`\n**`
                )
                .setTimestamp()
                .setFooter({
                  text: `Robo Hamster`,
                  iconURL: bot.user.displayAvatarURL(),
                }),
            ],
          });
          return `Вы успешно сняли 1 выговор! Теперь у Вас \`${
            warns.filter((warnOrRebuke) => warnOrRebuke.group === "rebuke")
              .length - 1
          }\` выговор(ов)`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Купить 10 лвл (rank)`, // название услуги (с большой буквы)
        customId: "bshop_10level", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 150, // необходимое количество баллов для покупки услуги
        filter() {
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          return true;
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          return `Вы успешно купили 10 уровней в системе JuniperBot! Ожидайте выдачи от совета администрации и выше!`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Купить 20 лвл (rank)`, // название услуги (с большой буквы)
        customId: "bshop_20level", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 280, // необходимое количество баллов для покупки услуги
        filter() {
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          return true;
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          return `Вы успешно купили 20 уровней в системе JuniperBot! Ожидайте выдачи от совета администрации и выше!`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Купить 30 лвл (rank)`, // название услуги (с большой буквы)
        customId: "bshop_30level", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 400, // необходимое количество баллов для покупки услуги
        filter() {
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          return true;
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          return `Вы успешно купили 30 уровней в системе JuniperBot! Ожидайте выдачи от совета администрации и выше!`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Получить иммунитет`, // название услуги (с большой буквы)
        customId: "bshop_imun", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 120, // необходимое количество баллов для покупки услуги
        filter({ main: { immunities } }) {
          if (immunities >= maxCountImmunities) {
            return {
              error: true,
              text: `У Вас есть максимальное количество иммунитетов - \`${maxCountImmunities}\` `,
              status: `ERR`,
            };
          }
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          setModerInfoParam(
            user.id,
            guild.id,
            "main",
            "immunities",
            ({ immunities }) => immunities + 1
          );
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          const punishModeratorsLog = guild.channels.cache.get(
            channelsId.punishModeratorsLog
          );
          punishModeratorsLog.send({
            content: `${user}`,
            embeds: [
              new EmbedBuilder()
                .setColor(Colors.DarkGreen)
                .setTitle(`📌 | Выдача иммунитета`)
                .setAuthor({
                  name: guild.name,
                  iconURL: guild.iconURL(),
                })
                .setDescription(
                  `**「📝」Получил: <@${user.id}>\n「📕」Причина: \`Покупка за баллы\`\n**`
                )
                .setTimestamp()
                .setFooter({
                  text: `Robo Hamster`,
                  iconURL: bot.user.displayAvatarURL(),
                }),
            ],
          });
          return `Вы успешно один иммунитет! Теперь у Вас \`${
            main.immunities + 1
          }\` иммунитет(а) `;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Купить x2 Баллы`, // название услуги (с большой буквы)
        customId: "bshop_x2balls", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 250, // необходимое количество баллов для покупки услуги
        filter() {
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          setModerInfoParam(user.id, guild.id, "main", "coefficient", 2);
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          return `Вы успешно купили X2 баллы!`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Купить x3 Баллы`, // название услуги (с большой буквы)
        customId: "bshop_x3balls", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 500, // необходимое количество баллов для покупки услуги
        filter() {
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          setModerInfoParam(user.id, guild.id, "main", "coefficient", 2);
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          return `Вы успешно купили X3 баллы!`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
      {
        name: `Купить персональную роль на две недели `, // название услуги (с большой буквы)
        customId: "bshop_role", // customId который будет равен тому же что в кнопке в bshop
        requiredBalls: 250, // необходимое количество баллов для покупки услуги
        filter() {
          return {
            status: `OK`,
          };
        }, // фильтер пользователей которым эта услуга не подойдёт
        execute() {
          return true;
        }, // выполнение логики услуги. НЕ ПИСАТЬ ЗДЕСЬ ЭМБЕДЫ И ТОМУ ПОДОБНОЕ ОФОРМЛЕНИЕ
        answer() {
          return `Вы успешно купили персональную роль на две недели! Ожидайте выдачи от Jr.D и выше!`;
        }, // метод для оповещения об услуге в разных каналах. Можно писать разные эмбеды, оформления. Метод должен возвращать строку с ответом пользователю
      },
    ];

    const service = services.find((service) => service.customId === customId);
    if (service.requiredBalls > balls) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**У Вас недостаточно баллов!\nТребуется: \`${
                service.requiredBalls
              }\`\nИмеющееся количество: \`${balls.toFixed(2)}\`**`
            )
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL(),
            })
            .setColor(Colors.Red)
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL(),
            }),
        ],
      });
    }
    // проверяем есть ли у модератора необходимые параметры если они нужны для покупки этой услуги
    const filterResult = service.filter({ main, week, warns });
    if (filterResult.status === "ERR") {
      // если нет, то отдаём ошибку
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(`**${filterResult.text}**`)
            .setColor(Colors.Red)
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
    }

    // если всё ок, то выполняем услугу
    await service.execute();
    await setModerInfoParam(
      user.id,
      guild.id,
      "main",
      "balls",
      ({ balls }) => balls - service.requiredBalls
    );

    // как только всё закончилось - отдаём модератору ответ и кайфуем
    interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | ${service.name}!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(`**${await service.answer()}**`) // service.answer может отправлять внутри себя сообщения, но должен возвращать строку с ответом. Без форматировании текста
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
    // так-же, нужно отправить лог об этой покупке в канал лог-покупок-модераторов
    const logBuysModerators = guild.channels.cache.get(
      channelsId.logBuysModerators
    );
    logBuysModerators.send({
      content: `<@&${rolesId.adviceAdministration}> <@&${rolesId.juniorDiscordMaster}>`,
      embeds: [
        new EmbedBuilder()
          .setColor(Colors.DarkGreen)
          .setTitle(`📌 | Система покупок!`)
          .setAuthor({
            name: guild.name,
            iconURL: guild.iconURL(),
          })
          .setDescription(
            `**「📝」Кто купил: <@${user.id}>\n「📕」Что купил \`${service.name}\`\n**`
          )
          .setTimestamp()
          .setFooter({
            text: `Robo Hamster`,
            iconURL: bot.user.displayAvatarURL(),
          }),
      ],
    });
  },
};
