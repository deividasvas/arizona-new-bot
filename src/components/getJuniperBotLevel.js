const axios = require('axios');
const { Collection } = require("discord.js");
const convertMinutesToMs = require("./convertMinutesToMs");

// Коллекция с кешированными пользователями внутри.
let cache = [];

// Интервал для удаления неактуальных пользователей с КД.
setInterval(() => {
	// Время через которое пользователя нужно удалить из коллекции. Указано должно быть в миллисекундах.
	const time = 1200000; // 20 минут.
	const usersEndTime = cache.filter((user) => (
		new Date() - user.date
	) >= time);
	// Новый массив с пользователями у которых активно КД.
	const arr = [];
	for(const user of cache){
		for(const userEndTime of usersEndTime){
			if(user.id === userEndTime.id && user.guildId !== userEndTime.guildId){
				continue;
			}
		}
		arr.push(user);
	}
	cache = arr;
}, convertMinutesToMs(1));

// Функция возвращает уровень пользователя из системы JuniperBot.
const getJuniperBotLevel = async (bot, userId, guildId) => {
	if(!userId || !guildId){
		return 0;
	}
	// Если пользователь кэширован, то возвращаем его уровень.
	const cachedUser = cache.find(user => user.id === userId && user.guildId === guildId);
	if(cachedUser){
		return cachedUser.level;
	}

	const url = `https://juniper.bot/api/public/ranking/list/${guildId}`;
	const { username } = await bot.users.fetch(userId);

	// Промис должен возвращать цифру.
	const lvlInfo = await new Promise(async (resolve, reject) => {
		const request = await axios({
			url,
			method: "post",
			headers: {},
			validateStatus: () => true,
			data: {
				page: 0,
				size: 50,
				search: username,
				sortBy: "EXP"
			}
		})
		const result = request.data.content.find((lvl) => lvl.id === userId);
		resolve(result?.level || 0);
	});

	// Добавляем пользователя в кэш
	cache.push({
		id: userId,
		guildId,
		level: lvlInfo,
		date: new Date(),
	})

	return lvlInfo;
}

module.exports = getJuniperBotLevel;