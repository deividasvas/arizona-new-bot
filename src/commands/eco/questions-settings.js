const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require('discord.js')
const QuestionsGame = require('../../models/QuestionsGame')

module.exports = {
  name: 'questions-settings', // название команды
  descr: 'Редактировать ответы на викторину', // описание команды
  showInSlashCommands: false, // показывать ли команду в slash командах
  arguments: [
    {
      name: 'действие',
      description: 'Действие которое Вы хотите совершить',
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: 'Получить все',
          value: 'getAll'
        },
        {
          name: 'Получить одно',
          value: 'getOne'
        },
        {
          name: 'Отредактировать вопрос или ответ',
          value: 'edit'
        },
        {
          name: 'Добавить новый вопрос и ответ',
          value: 'add'
        },
        {
          name: 'Удалить вопрос',
          value: 'delete'
        }
      ],
      required: true
    },
    {
      name: 'номер-значение',
      description: 'ID вопроса или значение для нового вопроса',
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: 'вопрос',
      description: 'Значение для нового вопроса',
      type: ApplicationCommandOptionType.String,
      required: false
    },
    {
      name: 'ответ',
      description: 'Значение для нового ответа',
      type: ApplicationCommandOptionType.String,
      required: false
    }
  ], // аргументы
  perms: (rolesId) => [
    rolesId.discordMaster,
    rolesId.juniorDiscordMaster
  ], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

  run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
    const action = args[0]
    const questions = await QuestionsGame.find()
    if (action === 'getAll') {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Вопросы-ответы`)
            .setColor(Colors.Blue)
            .setDescription(`**\`Индекс | Вопрос | Ответ\`\n${questions.map((question, index) => `${index} | ${question.text} | [${question.answers.join(', ')}]`).join('\n')}**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (action === 'getOne' || action === 'delete' || action === 'edit') {
      const questionNumber = Number(args[1])
      if (isNaN(questionNumber)) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Вы не указали параметр \`номер вопроса\`!\nНеобходимо указать число!**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }

      const question = questions[questionNumber - 1]

      if (!question) {
        return interaction.reply({
          ephemeral: true,
          embeds: [
            await new EmbedBuilder()
              .setTitle(`❌ | Ошибка!`)
              .setDescription(
                `**Вопроса под номером \`${questionNumber}\` не существует!**`
              )
              .setColor(Colors.Blue)
              .setAuthor({
                name: guild.name,
                iconURL: guild.iconURL()
              })
              .setFooter({
                text: `Robo Hamster`,
                iconURL: bot.user.displayAvatarURL()
              })
          ]
        })
      }
    }

    if (action === 'edit' && ( !args[2] || !args[3])) {
      return interaction.reply({
        ephemeral: true,
        embeds: [
          await new EmbedBuilder()
            .setTitle(`❌ | Ошибка!`)
            .setDescription(
              `**Вы не указали вопрос или ответ!**`
            )
            .setColor(Colors.Blue)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (action === 'getOne') {
      const questionNumber = Number(args[1])
      const question = questions[questionNumber - 1]

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Вопрос-ответ`)
            .setColor(Colors.Blue)
            .setDescription(`**\`Индекс | Вопрос | Ответ\`\n${questionNumber} | ${question.text} | [${question.answers.join(', ')}]**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (action === 'delete') {
      const questionNumber = Number(args[1]);
      const question = questions[questionNumber]

      await QuestionsGame.deleteOne({
        text: question.text,
        answers: question.answers
      })

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Удаление вопроса`)
            .setColor(Colors.Blue)
            .setDescription(`**\`Индекс | Вопрос | Ответ\`\n${questionNumber} | ${question.text} | [${question.answers.join(', ')}]\n\nВопрос и ответ к нему были успешно удалены!**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if (action === 'edit') {
      const questionNumber = Number(args[1])
      const question = questions[questionNumber]
      const newText = args[2];
      const newValue = args[3];

      await QuestionsGame.updateOne(
        {
          ...question
        },
        {
          text: newText,
          answers: newValue.split(',')
        }
      )

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Изменение запроса вопроса`)
            .setColor(Colors.Blue)
            .setDescription(`**Старые данные:\n\`Индекс | Вопрос | Ответ\`\n${questionNumber} | ${question.text} | [${question.answers.join(', ')}]\n\nНовые данные:\n\`Индекс | Вопрос | Ответ\`\n${questionNumber} | ${newText} | ${newValue}**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }

    if(action === 'add'){
      const text = args[1];
      const value = args[2];

      await QuestionsGame.insertMany([
        {
          text,
          answers: JSON.parse(value),
        }
      ])

      return interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setTitle(`💰 | Создание нового вопроса`)
            .setColor(Colors.Blue)
            .setDescription(`**\`Индекс | Вопрос | Ответ\`\n${questions.length} | ${text} | [${JSON.parse(value).join(', ')}]**`)
            .setAuthor({
              name: guild.name,
              iconURL: guild.iconURL()
            })
            .setFooter({
              text: `Robo Hamster`,
              iconURL: bot.user.displayAvatarURL()
            })
        ]
      })
    }
  }
}
