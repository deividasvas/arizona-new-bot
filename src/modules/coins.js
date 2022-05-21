const setUserCoinsParam = require("../components/setUserCoinsParam");
const convertMinutesToMs = require("../components/convertMinutesToMs");
const CoinsUsers = require('../models/CoinsUsers');
const { channelsId } = require("../configs/settings");
const { EmbedBuilder, Colors } = require("discord.js");
const { lastUpdateDate } = require('../configs/surprisecoins.json');
const fs = require("fs");
const path = require("path");

module.exports = {
	/*
	  Описание модуля
	  Данный модуль создан для того, чтобы обрабатывать магазин койнов и для того, чтобы выдавать койны за сообщения.
	*/
	autoRun: true, // автоматический запуск модуля
	name: "coins", // имя модуля
	acceptCustomsId: [], // модуль автоматически принимает эти айдишники interaction.customId
	usersInVoice: [], // пользователи которые находятся в голосовых каналах
	initial: false, // если не разу не запускался метод init, то inited - false
	isValidChannelForGiveXp(channel) {
		// Если количество пользователей в канале один или меньше, то это не валидный канал.
		if (channel.members.size <= 1) {
			return false;
		}
		// Функция для проверки являются ли все пользователи в канале замучеными
		const getAllMutedUsersInVoice = () => {
			const mutes = [];
			for (const [userId, member] of channel.members) {
				const { voice } = member;
				if (voice.selfDeaf || voice.selfMute || voice.serverDeaf || voice.serverMute) {
					mutes.push(member);
				}
			}
			return mutes;
		}
		const allMutedUsersInVoiceMembers = getAllMutedUsersInVoice();
		if (allMutedUsersInVoiceMembers.length === channel.members.size || allMutedUsersInVoiceMembers.length === channel.members.size - 1) {
			return false;
		}
		return true;
	},
	async restartPays(bot) {
		// Обнуляем всем пользователям количество переданных монет.
		await CoinsUsers.updateMany({}, {
			paidOfDay: 0
		});
		for (const [id, guild] of bot.guilds.cache) {
			const date = new Date();
			const { logCoins } = channelsId[id];
			const logCoinsChannel = guild.channels.cache.get(logCoins);
			logCoinsChannel.send({
				embeds: [
					new EmbedBuilder()
						.setTitle(`💰 | Перезагрузка переводов!`)
						.setDescription(`**Дневные ограничения на перевод были убраны!**`)
						.setColor(Colors.Blue)
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.addFields([
							{
								name: `Время`,
								value: `${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })}`
							}
						])
				]
			});
		}
	},
	init({ bot }) {
		setInterval(async () => {
			for (const [id, guild] of bot.guilds.cache) {
				for (const [userId, member] of guild.members.cache) {
					if (!member.voice?.channel) {
						continue;
					}
					const { channel } = member.voice;
					if (!this.isValidChannelForGiveXp(channel)) {
						continue;
					}
					await setUserCoinsParam(userId, guild.id, "coins", ({ coins, rates, coefficient }) => {
						return (
							coins + rates.voice * coefficient
						).toFixed(4);
					})
				}
			}
		}, convertMinutesToMs(1));
		this.lastDateRestartCoins = new Date(lastUpdateDate);
		setInterval(async () => {
			const date = new Date();
			if (date.getDate() !== this.lastDateRestartCoins.getDate()) {
				// Перезапускаем платежи.
				await this.restartPays(bot);
				const date = new Date();
				await fs.writeFileSync(path.resolve(`./src/configs/surprisecoins.json`), JSON.stringify({
					lastUpdateDate: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
				}))
			}
		}, 1000);
		this.initial = true;
	},

	async run({ bot, message, interaction, newMember, oldMember }) {
		if (!this.initial) {
			this.init({ bot });
		}
		const member = message?.author || interaction?.member;
		const guild = message?.guild || bot.guilds.cache.get(interaction?.guildId);
		// Если при запуске модуля передаётся туда сообщение, то вызвано оно из messageCreate. Соответственно,
		// нужно выдать койны за сообщение.
		if (message) {
			return await setUserCoinsParam(member.id, guild.id, 'coins', ({ coins, coefficient, rates, platforms }) => {
				const num = (
					coins + (
						rates.message * platforms || rates.message
					)
				) * coefficient;
				return num.toFixed(4);
			});
		}
	}
};