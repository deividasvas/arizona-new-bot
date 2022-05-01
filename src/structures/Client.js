const {
    Client,
    Collection,
    ApplicationCommandPermissionType,
} = require("discord.js");
const fs = require("fs");
const settings = require("../configs/settings");
const {SlashCommandBuilder} = require("@discordjs/builders");
const path = require("path");
const {default: mongoose} = require("mongoose");

module.exports = class ExtendedClient extends Client {
    constructor() {
        super({
            intents: 32767,
        });

        this.commands = new Collection();
        this.modules = new Collection();
        this.fractions = {
            data: [],
            init: false,
            dateOldInit: null,
        };
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
        for (const dir of fs.readdirSync("./src/commands/")) {
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

                    // если данная команда не находится в архиве, то добавляем её в слэш команды
                    if (!pull.archive) {
                        await this.loadSlashCommand(pull, guild);
                    }

                }
            }
        }

        // console.log(this.commands)

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
            // проверяем существует ли доступ для everyone у команды, если нет
            // то устанавливаем изначальное право для команды, что нельзя
            buildCommand.setDefaultPermission(false);
        } else {
            // если существует, то ставим что можно
            buildCommand.setDefaultPermission(true);
        }

        const commandInfoGuild = guild.commands.cache.find(
            (command) => command.name === buildCommand.name
        ); // пытаемся найти уже существующую такую команду, чтобы просто обновить права и не создавать новую.
        if (commandInfoGuild) {
            // Проверяем есть ли разница между изначальными правами для команды, если да, то меняем значение.
            if (buildCommand.defaultPermission !== commandInfoGuild.defaultPermission) {
                await commandInfoGuild.setDefaultPermission(buildCommand.defaultPermission);
                console.log(`[📌 | ${buildCommand.name}]: Были обновлены права для обычных пользователей!`)
            }
            // Проверяем разные ли аргументы между собой. Если да, то устанавливаем новые

            const actualArguments = buildCommand.options.map(argument => ({
                name: argument.name,
                description: argument.description,
                type: argument.type,
                required: argument.required,
            }));

            const newArguments = commandInfoGuild.options.map(argument => ({
                name: argument.name,
                description: argument.description,
                type: argument.type,
                required: argument.required,
            }));

            if (JSON.stringify(actualArguments) !== JSON.stringify(newArguments)) {
                await commandInfoGuild.setOptions(buildCommand.options); // устанавливаем аргументы для команды
                console.log(`[📌 | ${buildCommand.name}]: Были успешно изменены аргументы!`)
            }
            // Проверяем есть ли разница в описании обоих команд.
            if (buildCommand.description !== commandInfoGuild.description) {
                await commandInfoGuild.setDescription(buildCommand.description);
                console.log(`[📌 | ${buildCommand.name}]: Было успешно изменено описание!`)
            }
            return console.log(`[📌 | ${buildCommand.name}]: Обновление закончено!`)
        }

        // создаём команду если её ещё не создавали
        const newCommand = await guild.commands.create(buildCommand);
        // устанавливаем изначальное право для использования её everyone
        await newCommand.setDefaultPermission(buildCommand.defaultPermission);
        console.log(`[📌 | ${buildCommand.name}]: Успешная инициализация!`)
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
        // пере инициализация прав для семейных команд
        const guild = this.guilds.cache.get(this.guildId);
        fs.readdirSync(`./src/commands/families`).map(async (fileName) => {
            const command = require(path.resolve(
                `./src/commands/families/${fileName}`
            ));
            await this.loadSlashCommand(command, guild);
        });
    }

    async connectionDataBase() {
        mongoose.connect(settings.database.url, {}, (err) => {
            if (err) {
                throw err;
            }
            console.log(`[📌 | Mongo] База данных успешно запущена!`);
        });
        this.connection = mongoose.connection;
    }
};
