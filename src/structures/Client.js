const {
  Client,
  Collection,
  ApplicationCommandOptionType,
  ApplicationCommandPermissionType,
} = require("discord.js");
const fs = require("fs");
const mysql = require("mysql");
const { database } = require("../configs/settings");
const settings = require("../configs/settings");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Routes } = require("discord-api-types/v9");
const { REST } = require("@discordjs/rest");
const { bot } = require("..");
const path = require("path");
const { default: mongoose } = require("mongoose");

module.exports = class ExtendedClient extends Client {
  constructor() {
    super({
      intents: 32767,
    });

    this.commands = new Collection();
    this.modules = new Collection();
    this.buildCommandeds = new Collection();
    const {
      mainAdmin,
      deputyMainAdmin,
      curator,
      discordMaster,
      juniorDiscordMaster,
    } = settings.rolesID;
    this.whiteListRoles = [
      // белый список ролей
      mainAdmin, // ГА
      deputyMainAdmin, // ЗГА
      curator, // Куратор
      discordMaster, // Дискорд Мастер
      juniorDiscordMaster, // Junior дискорд мастер
    ];
    this.token = settings.token;
    this.applicationId = settings.applicationId;
    this.guildId = settings.SurpriseGuild;

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
    const buildCommandes = [];
    const guild = this.guilds.cache.get(this.guildId); // получаем дискорд сервер на котором будут запущены команды
    fs.readdirSync("./src/commands/").forEach(async (dir) => {
      // инициализируем саму команду
      const commands = fs
        .readdirSync(`./src/commands/${dir}/`)
        .filter((file) => file.endsWith(".js"));
      for (let file of commands) {
        let pull = require(`../commands/${dir}/${file}`);
        if (pull.name) {
          this.commands.set(pull.name, pull); // устанавливаем инициализированную команду
          const buildCommanded = new SlashCommandBuilder(); // создаём slash команду которая будет введена на сервер
          buildCommanded.setName(pull.name);
          buildCommanded.setDescription(pull.descr);
          buildCommanded.options = [...pull.arguments];
          buildCommandes.push(buildCommanded);
        } else {
          continue;
        }
      }
    });
    for (const buildCommand of buildCommandes) {
      const theCommand = this.commands.get(buildCommand.name); // получаем саму команду для настройек прав
      const permissions = await (
        await theCommand.perms(this)
      ).map((roleID) => ({
        type: ApplicationCommandPermissionType.Role,
        id: roleID,
        permission: true,
      })); // создаём массив с правами

      for (const whiteRoleID of this.whiteListRoles) {
        // белый список ролей
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
        commandInfoGuild.setOptions(theCommand.arguments)
        console.log(`${buildCommand.name} уже существует! Обновил ей права`);
        continue;
      }

      const command = await guild.commands.create(buildCommand); // создаём команду если её ещё не создавали
      await command.permissions.set({
        permissions,
      }); // обновляем права у только что созданной команды
      console.log(
        `${buildCommand.name} была успешно создана! Права инициализированы!`
      );
    }

    console.log(
      `[📌 | Commands]: ${this.commands.size} команд успешно загружено!`
    );
  }
  async deleteSlashCommand(commandId, guild) {
    await guild.commands.delete(commandId);
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
      if(err){
        throw err;
      }
      console.log(`[MONGO] База данных успешно запущена!`);
    });
    this.connection = mongoose.connection;
  }
};
