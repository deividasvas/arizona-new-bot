const {
  Client,
  Collection,
  ApplicationCommandPermissionType,
} = require("discord.js");
const fs = require("fs");
const settings = require("../configs/settings");
const { SlashCommandBuilder } = require("@discordjs/builders");
const path = require("path");
const { default: mongoose } = require("mongoose");

module.exports = class ExtendedClient extends Client {
  constructor() {
    super({
      intents: 32767
    });

    this.commands = new Collection();
    this.modules = new Collection();
    this.buildCommandeds = new Collection();
    this.token = settings.token;
    this.applicationId = settings.applicationId;
    this.guildId = settings.surpriseGuild;
    this.prefix = settings.prefix;
    this.fullPermissionCommandsRolesId = settings.fullPermissionCommandsRolesId;
    this.whiteListRoles = settings.whiteListRoles;
    this.typesArguments = settings.typesArguments;
    this.login(this.token);
    this.module();
    this.events();
    this.connectionDataBase();
  }

  // async login(token) {
  //     super.login(token)

  //     this.module();
  //     this.events();
  //     this.command();
  // }

  async events() {
    let loadEvents = 0;
    fs.readdirSync("./src/events/")
      .filter((name) => name.endsWith(".js"))
      .forEach((file) => {
        let event = require(`../events/${file}`);
        let eventName = file.split(".js")[0];

        this.on(eventName, event.bind(null, this));

        loadEvents++;
      });

    console.log(`[📌 | Events]: ${loadEvents} событий успешно загружено!`);
  }

  async command() {
    // return;
    // ЗАПУСКАЕТСЯ В ready.js, потому что иначе бот не успевает прогрузиться.
    const guild =
      this.guilds.cache.get(this.guildId) ||
      (await this.guilds.fetch(this.guildId)); // получаем дискорд сервер на котором будут запущены команды
    fs.readdirSync("./src/commands/").forEach(async (dir) => {
      // инициализируем саму команду
      const commands = fs
        .readdirSync(`./src/commands/${dir}/`)
        .filter((file) => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`../commands/${dir}/${file}`);
        if (pull.name) {
          this.commands.set(pull.name, {
            ...pull,
            category: dir,
          }); // устанавливаем инициализированную команду

          if (pull.showInSlashCommands === true) {
            // если данная включена в показ в слэш командах, то добавляем её в слэш команды
            this.loadSlashCommand(pull, guild);
          }
        } else {
          continue;
        }
      }
    });

    console.log(
      `[📌 | Commands]: ${this.commands.size} команд успешно загружено!`
    );
  }
  async deleteSlashCommand(commandId, guild) {
    await guild.commands.delete(commandId);
  }
  async loadSlashCommand(command, guild) {
    const buildCommand = new SlashCommandBuilder(); // создаём slash команду которая будет введена на сервер
    buildCommand.setName(command.name); // устанавливаем название команде
    buildCommand.setDescription(command.descr); // устанавливаем описание команды
    buildCommand.options = [...command.arguments]; // устанавливаем аргументы команды
    const permissions = await (
      await command.perms(this)
    ).map((roleID) => ({
      type: ApplicationCommandPermissionType.Role,
      id: roleID,
      permission: true,
    })); // создаём массив с правами

    for (const whiteRoleID of this.fullPermissionCommandsRolesId) {
      // белый список ролей у которых есть полный доступ ко всем командам
      permissions.push({
        type: ApplicationCommandPermissionType.Role,
        id: whiteRoleID,
        permission: true,
      }); // добавляем роли из белого списка доступ к команде
    }
    if (!permissions.find((perm) => perm.id === guild.roles.everyone.id)) {
      // проверяем, есть ли разрешение смотреть и использовать команду у everyone
      permissions.push({
        type: ApplicationCommandPermissionType.Role,
        id: guild.roles.everyone.id,
        permission: false,
      }); // если нет, то добавляем чтобы everyone нельзя было использовать эту команду
    }
    const commandInfoGuild = guild.commands.cache.find(
      (command) => command.name === buildCommand.name
    ); // пытаемся найти уже существующую такую команду, чтобы просто обновить права и не создавать новую.
    if (commandInfoGuild) {
      await commandInfoGuild.permissions.set({
        permissions,
      }); // обновляем права если команда существует
      commandInfoGuild.setOptions(command.arguments);
      return;
    }

    const newCommand = await guild.commands.create(buildCommand); // создаём команду если её ещё не создавали
    await newCommand.permissions.set({
      permissions,
    }); // обновляем права у только что созданной команды
  }
  async deleteAllSlashCommands() {
    await this.guilds.fetch();
    for (const guild of this.guilds.cache.values()) {
      await guild.commands.fetch();
      for (const command of guild.commands.cache.values()) {
        await guild.commands.delete(command.id);
        console.log(`${command.name} удалена!`);
      }
    }
  }

  async module() {
    fs.readdirSync(`./src/modules/`)
      .filter((name) => name.endsWith(".js"))
      .forEach((module) => {
        const pullModule = require(`../modules/${module}`);

        if (pullModule.name) {
          this.modules.set(pullModule.name, pullModule);
        }
      });

    console.log(
      `[📌 | Modules]: ${this.modules.size} модулей было успешно загружено!`
    );
  }

  async reInitPermissionsForFamilies() {
    // переинициализация прав для семейных команд
    const guild = this.guilds.cache.get(this.guildId);
    fs.readdirSync(`./src/commands/families`).forEach(async (fileName) => {
      const command = require(path.resolve(
        `./src/commands/families/${fileName}`
      ));
      const commandGuild = guild.commands.cache.find(
        (buildCommand) => buildCommand.name === command.name
      );
      const permissions = await (
        await command.perms(this)
      ).map((roleID) => ({
        type: ApplicationCommandPermissionType.Role,
        id: roleID,
        permission: true,
      })); // создаём массив с правами

      for (const whiteRoleID of this.whiteListRoles) {
        // белый список прав
        permissions.push({
          type: ApplicationCommandPermissionType.Role,
          id: whiteRoleID,
          permission: true,
        }); // добавляем роли из белого списка доступ к команде
      }
      if (!permissions.find((perm) => perm.id === guild.roles.everyone.id)) {
        // проверяем, есть ли разрешение смотреть и использовать команду у everyone
        permissions.push({
          type: ApplicationCommandPermissionType.Role,
          id: guild.roles.everyone.id,
          permission: false,
        }); // если нет, то добавляем чтобы everyone нельзя было использовать эту команду
      }
      commandGuild.setOptions([...command.arguments]);
      commandGuild.permissions.set({
        permissions,
      });
    });
  }

  async connectionDataBase() {
    mongoose.connect(settings.database.url, (err) => {
      if (err) {
        throw err;
      }
      console.log(`[MONGO] База данных успешно запущена!`);
    });
    this.connection = mongoose.connection;
  }
};
