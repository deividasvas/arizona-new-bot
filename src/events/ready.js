const {availableGuildsId} = require("../configs/settings");
const {Collection} = require("discord.js");
module.exports = async bot => {
    bot.user.setActivity({ name: 'за саморазвитием', type: 'watching', status: 'online' }) // * Активность
    // Очищаем весь кэш серверов дабы не использовать сервер к которому у нас нет настройки
    bot.guilds.cache.clear();
    for(const guildId of availableGuildsId){
        // Подгружаем сервера к которым у нас есть настройка.
        await bot.guilds.fetch({
            guild: guildId,
        });
    }

    for(const guild of bot.guilds.cache.values()){
        await guild.channels.fetch();
        await guild.commands.fetch();
    }
    // await bot.deleteAllSlashCommands();
    await bot.command();
    for(const [moduleName, module] of bot.modules){
        // Если в модуле установлено автоматически его запускать при старте бота, то запускаем.
        if(module.autoRun){
            module.run({ bot });
        }
    }

    bot.inited = true;
    console.log(`\n[📌 | Ready]: Бот запущен. Авторизован как %s | Серверов: %d | Пользователей: %d | Каналов: %d | Команд: %d`, bot.user.tag, bot.guilds.cache.size, bot.users.cache.size, bot.channels.cache.size, bot.commands.size);
}