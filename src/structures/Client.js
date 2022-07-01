const {
  Client, Collection, ApplicationCommandPermissionType, GatewayIntentBits, Partials, PermissionFlagsBits
} = require('discord.js')
const fs = require('fs')
const settings = require('../configs/settings')
const {getGuildRolesId} = settings;
const {SlashCommandBuilder} = require('discord.js')
const path = require('path')
const {default: mongoose} = require('mongoose')
const VkBot = require('node-vk-bot-api')

module.exports = class ExtendedClient extends Client {
  constructor() {
      super({
          intents: [GatewayIntentBits.DirectMessages, GatewayIntentBits.DirectMessageReactions, GatewayIntentBits.DirectMessageTyping, GatewayIntentBits.Guilds, GatewayIntentBits.GuildBans, GatewayIntentBits.GuildEmojisAndStickers, GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildInvites, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildMessageTyping, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildWebhooks, GatewayIntentBits.MessageContent],
          partials: [Partials.Reaction, Partials.Message, Partials.Channel, Partials.GuildMember, Partials.GuildScheduledEvent, Partials.User]
      })

      this.commands = new Collection()
      this.modules = new Collection()
      this.dateStart = new Date();
      this.fractions = {
          data: [],
          init: false,
          dateOldInit: null
      }
      this.token = settings.token
      this.prefix = settings.prefix
      this.fullPermissionCommandsRolesId = settings.fullPermissionCommandsRolesId
      this.whiteListRoles = settings.whiteListRoles
      this.typesArguments = settings.typesArguments
      this.inited = false // используется в ready.js
      this.tagsFractions = settings.tagsFractions
      // Путь до корневой директории проекта
      this.mainPathProject = path.join(__dirname, '../')
      this.authVkBot().then(() => {
          this.sendConferenceDiscordMastersMessage = text => this.vk.sendMessage(2000000001, text)
      });
      this.login(this.token)
      this.module()
      this.events()
      this.connectionDataBase()
  }

  async authVkBot() {
      const vk = new VkBot({token: `5ec415c3f848afaa88af5dd6ac3ffcccb7b2dc12dd369d72b3003ee42d069282311baaef97ef0ae0bf2d7`})
      vk.startPolling((err) => {
          if (err) {
              return console.log(err)
          }
          console.log('[📌 | VK BOT]: Бот успешно запущен!')
          this.vk = vk
      })
  }

  // async login(token) {
  //     super.login(token)

  //     this.module();
  //     this.events();
  //     this.command();
  // }

  async events() {
      let loadEvents = 0
      fs.readdirSync(path.join(this.mainPathProject, 'events'))
          .filter((name) => name.endsWith('.js'))
          .forEach((file) => {
              let event = require(`../events/${file}`)
              let eventName = file.split('.js')[0]

              if (eventName === 'ready') {
                  return this.once(eventName, event.bind(null, this));
              }

              const callback = event.bind(null, this);
              this.on(eventName, (...args) => {
                  // Белый список событий который
                  const whiteListEvents = ['messageCreate', 'interactionCreate'];
                  // Если это сообщение, и оно отправлено в лс бота, то передаём его напрямую без проверок.
                  if(whiteListEvents.includes(eventName) && !args[0].guild){
                      return callback(...args);
                  }
                  // Проверка на то, является ли сервер валидным для работы.
                  const guildId = args[0].guild?.id || args[0].d?.guild_id;
                  if (!guildId) {
                      return;
                  }
                  if (settings.availableGuildsId.includes(guildId)) {
                      callback(...args);
                  }
              })
              // this.
              loadEvents++
          })

      console.log(`[📌 | Events]: ${loadEvents} событий успешно загружено!`)
  }

  async command() {
      // ЗАПУСКАЕТСЯ В ready.js, потому что иначе бот не успевает прогрузиться.
      for (const [id, guild] of this.guilds.cache) {
          for (const dir of fs.readdirSync(path.join(this.mainPathProject, 'commands'))) {
              // инициализируем саму команду
              const commands = fs
                  .readdirSync(path.join(this.mainPathProject, `commands/${dir}`))
                  .filter((file) => file.endsWith('.js'))
              for (let file of commands) {
                  let pull = require(`../commands/${dir}/${file}`)
                  if (pull.name) {
                      this.commands.set(pull.name, {
                          ...pull,
                          category: dir
                      }) // устанавливаем инициализированную команду

                      // если данная команда не находится в архиве, то добавляем её в слэш команды
                      if (!pull.archive) {
                          await this.loadSlashCommand(pull, guild)
                      }

                  }
              }
          }
      }

      // console.log(this.commands)

      console.log(
          `[📌 | Commands]: ${this.commands.size} команд успешно загружено!`
      )
  }

  async deleteSlashCommand(commandId, guild) {
      if(guild){
          await guild.commands.delete(commandId)
      } else {
          await this.application.commands.delete(this.application.commands.cache.get(commandId));
      }
  }

  async loadSlashCommand(command, guild) {
      const buildCommand = new SlashCommandBuilder() // создаём slash команду которая будет введена на сервер
      buildCommand.setName(command.name) // устанавливаем название команде
      buildCommand.setDescription(command.descr) // устанавливаем описание команды
      buildCommand.options = [...command.arguments] // устанавливаем аргументы команды
      const rolesId = getGuildRolesId(guild.id); // айди ролей на сервере

      const permissions = await (
          await command.perms(rolesId)
      ).map((roleId) => (
          {
              type: ApplicationCommandPermissionType.Role,
              id: roleId,
              permission: true
          }
      )) // создаём массив с правами

      if (!command.isDMCommand) {
          for (const whiteRoleId of this.fullPermissionCommandsRolesId(rolesId)) {
              // белый список ролей у которых есть полный доступ ко всем командам
              permissions.push({
                  type: ApplicationCommandPermissionType.Role,
                  id: whiteRoleId,
                  permission: true
              }) // добавляем роли из белого списка доступ к команде
          }
      }
      // guild.roles.everyone
      if (command.isDMCommand) {
          buildCommand.setDMPermission(command.isDMCommand || null);
      }
      if (!permissions.find((perm) => perm.id === guild.id)) {
          // проверяем существует ли доступ для everyone у команды, если нет
          // то устанавливаем изначальное право для команды, что нельзя
          buildCommand.setDefaultMemberPermissions(0);
      }
      const commandInfoGuild = guild.commands.cache.find(
          (command) => command.name === buildCommand.name
      ) // пытаемся найти уже существующую такую команду, чтобы просто обновить права и не создавать новую.
      if (commandInfoGuild) {
          // Проверяем, если команда существует, но её режим только личные сообщение, то удаляем её и создаем в боте.
          if (buildCommand.dm_permission) {
              await commandInfoGuild.delete();
              if(!this.application.commands.cache.find(command => commnad.name === buildCommand.name)){
                  await this.application.commands.create({
                      ...buildCommand,
                      dmPermission: true,
                      defaultMemberPermissions: 0
                  });
              }
              // await commandInfoGuild.setDefaultMemberPermissions(buildCommand.default_member_permissions)
              console.log(`[📌 | ${buildCommand.name}]: Команда переключена в режим "Только личные сообщения"!`)
          }
          // Проверяем разные ли аргументы между собой. Если да, то устанавливаем новые

          const actualArguments = buildCommand.options.map(argument => (
              {
                  name: argument.name,
                  description: argument.description,
                  type: argument.type,
                  required: argument.required,
                  choices: argument.choices
              }
          ))

          const newArguments = commandInfoGuild.options.map(argument => (
              {
                  name: argument.name,
                  description: argument.description,
                  type: argument.type,
                  required: argument.required,
                  choices: argument.choices
              }
          ))

          if (JSON.stringify(actualArguments) !== JSON.stringify(newArguments)) {
              await commandInfoGuild.setOptions(buildCommand.options) // устанавливаем аргументы для команды
              console.log(`[📌 | ${buildCommand.name}]: Были успешно изменены аргументы!`)
          }
          // Проверяем есть ли разница в описании обоих команд.
          if (buildCommand.description !== commandInfoGuild.description) {
              await commandInfoGuild.setDescription(buildCommand.description)
              console.log(`[📌 | ${buildCommand.name}]: Было успешно изменено описание!`)
          }
          console.log(buildCommand.name, buildCommand.dm_permission, commandInfoGuild.dmPermission)

          return console.log(`[📌 | ${buildCommand.name}]: Обновление закончено!`)
      }

      // Если это команда в личных сообщений, то создаём её только для них.
      if(buildCommand.dm_permission){
          console.log({
              ...buildCommand,
              dmPermission: buildCommand.dm_permission,
              defaultMemberPermissions: 0,
          })
          await this.application.commands.create({
              ...buildCommand,
              dmPermission: buildCommand.dm_permission,
              defaultMemberPermissions: 0,
          });
          return console.log(`[📌 | ${buildCommand.name}]: Успешная инициализация | Direct Command!`)
      }

      await guild.commands.create(buildCommand);

      console.log(`[📌 | ${buildCommand.name}]: Успешная инициализация!`)
  }

  async deleteAllSlashCommands() {
      await this.guilds.fetch()
      for (const guild of this.guilds.cache.values()) {
          await guild.commands.fetch()
          for (const command of guild.commands.cache.values()) {
              await guild.commands.delete(command.id)
              console.log(`${command.name} удалена с сервера ${guild.name}!`)
          }
      }
      for(const command of this.application.commands.cache.values()){
          await command.delete();
          console.log(`${command.name} удалена из бота!`)
      }
  }

  async module() {
      fs.readdirSync(path.join(this.mainPathProject, 'modules'))
          .filter((name) => name.endsWith('.js'))
          .forEach((module) => {
              const pullModule = require(`../modules/${module}`)

              if (pullModule.name) {
                  this.modules.set(pullModule.name, pullModule)
              }
          })

      console.log(
          `[📌 | Modules]: ${this.modules.size} модулей было успешно загружено!`
      )
  }

  async connectionDataBase() {
      mongoose.connect(settings.database.url, {}, (err) => {
          if (err) {
              throw err
          }
          console.log(`[📌 | Mongo] База данных успешно запущена!`)
      })
      this.connection = mongoose.connection
  }
}