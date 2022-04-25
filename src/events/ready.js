module.exports = async bot => {
    bot.user.setActivity({ name: 'за Аrizona 🌺 Surprise', type: 'WATCHING', status: 'online' }) // * Активность
    await bot.guilds.fetch();
    for(const guild of bot.guilds.cache.values()){
        await guild.channels.fetch();
        await guild.commands.fetch();
    }
    await bot.command();
    const punishmentModule = await bot.modules.get("punishment");
    punishmentModule.run({ bot }); // запускаем снятие наказания тем у кого прошёл срок наказания
    console.log(`\n[📌 | Ready]: Бот запущен. Авторизован как %s | Серверов: %d | Пользователей: %d | Каналов: %d | Команд: %d`, bot.user.tag, bot.guilds.cache.size, bot.users.cache.size, bot.channels.cache.size, bot.commands.size);
}