const { EmbedBuilder, ApplicationCommandOptionType, Colors, Collection } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const {
	questionsWords,
	betMin,
	betMax,
	combinationsRockPaperScissors,
	countGamesForCoolDown
} = require("../../configs/settings");
const convertMinutesToMs = require("../../components/convertMinutesToMs");
const setUserCoinsParam = require("../../components/setUserCoinsParam");

// Коллекция с игроками у которых КД игры в азартные игры
const cooldown = new Collection();
// Коллекция с игроками и их количеством игр.
const countGames = new Collection();
setInterval(() => {
	// Каждые 5 секунд перебираем список людей у которых есть действующее КД.
	// Если прошли 10 минут КД, то удаляем человека из списка.
	for (const [userId, dateStart] of cooldown) {
		const minutes = (
			(
				new Date()
			).getTime() - (
				new Date(dateStart)
			).getTime()
		) / 60000;
		if (minutes >= 10) {
			return cooldown.delete(userId);
		}
	}
}, 5000);
const words = async ({ bot, interaction, author, profile, bet, guild, channel }) => {
	// Вопрос, который будет задан.
	const question = questionsWords[Math.round(Math.random() * questionsWords.length)];
	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Игра в слова!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Ответьте на вопрос!\n\`${question.text}\`\nУ Вас 1 минута на ответ!**`)
				.setAuthor({
					name: guild.name, iconURL: guild.iconURL()
				})
				.setFooter({
					text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
				})
		]
	});
	const messages = await channel.awaitMessages({
		filter: (msg) => msg.author.id === author.id && msg.channelId === channel.id,
		time: convertMinutesToMs(1),
		max: 1
	});

	if (!messages.size) {
		return interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Игра в слова!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Вы не успели ответить на вопрос! Игра окончена.**`)
					.setAuthor({
						name: guild.name, iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
					})
			]
		});
	}

	const answerMessage = messages.first();
	const answer = answerMessage.content;
	if (!question.answers.map(answer => answer.toLowerCase()).includes(answer.toLowerCase())) {
		await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
			return (
				coins - bet
			).toFixed(4);
		});
		return answerMessage.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Игра в слова!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Вы ответили неправильно! С Вашего счёта было снято \`${bet}\` монет!**`)
					.setAuthor({
						name: guild.name, iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
					})
			]
		});
	}

	await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
		return (
			coins + bet
		).toFixed(4);
	});
	await answerMessage.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Игра в слова!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Вы ответили правильно! На Ваш счёт начислено \`${bet}\` монет!**`)
				.setAuthor({
					name: guild.name, iconURL: guild.iconURL()
				})
				.setFooter({
					text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
				})
		]
	})
}

const rockPaperScissors = async ({ bot, interaction, author, profile, bet, guild, channel }) => {
	// Вопрос, который будет задан.
	const random = Math.round(Math.random() * (
		combinationsRockPaperScissors.length - 1
	));
	const combination = combinationsRockPaperScissors[random];
	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Камень-ножницы-бумага!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Напишите в чат одним из трёх предметов: \`Камень, ножницы, бумага\`! У Вас одна минута!**`)
				.setAuthor({
					name: guild.name, iconURL: guild.iconURL()
				})
				.setFooter({
					text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
				})
		]
	});
	const messages = await channel.awaitMessages({
		filter: (msg) => {
			return (
				msg.author.id === author.id && msg.channelId === channel.id
			) && combinationsRockPaperScissors.map(combination => combination.item).includes(msg.content)
		}, time: convertMinutesToMs(1), max: 1
	});

	if (!messages.size) {
		return interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Камень-ножницы-бумага!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Вы не успели ответить на вопрос! Игра окончена.**`)
					.setAuthor({
						name: guild.name, iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
					})
			]
		});
	}

	const answerMessage = messages.first();
	const answer = answerMessage.content;
	if (combination.item.toLowerCase() !== answer.toLowerCase()) {
		await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
			return (
				coins - bet
			).toFixed(4);
		});
		const winCombination = combinationsRockPaperScissors.find(combination => combination.hit.toLowerCase() === answer.toLowerCase());
		return answerMessage.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Камень-ножницы-бумага!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**У хомячка оказался предмет \`${winCombination.item}\`.\nВы проиграли!\nС Вашего счёта было снято \`${bet}\` монет!**`)
					.setAuthor({
						name: guild.name, iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
					})
			]
		});
	}

	await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
		return (
			coins + bet
		).toFixed(4);
	});
	await answerMessage.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Камень-ножницы-бумага!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**У хомячка оказался предмет \`${combination.hit}\`!\n Вы выиграли!\nНа Ваш счёт зачислено \`${bet.toFixed(4)}\` монет!**`)
				.setAuthor({
					name: guild.name, iconURL: guild.iconURL()
				})
				.setFooter({
					text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
				})
		]
	})
}

module.exports = {
	name: "game", // название команды
	descr: "Сыграть в игры на монеты", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "игра",
			description: "Игра в которую Вы будете играть",
			type: ApplicationCommandOptionType.String,
			required: true,
			choices: [
				{
					name: "Викторина(Нужно ответить правильно на поставленный вопрос)", value: "words"
				},
				{
					name: "Камень-ножницы-бумага(Нужно выбрать один из трёх предметов)", value: `rockPaperScissors`
				}
			]
		}, {
			name: "ставка",
			description: `Сумма монет на которую Вы хотите сыграть(от ${betMin} до ${betMax})`,
			type: ApplicationCommandOptionType.Number,
			required: true
		}
	], // аргументы
	perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

	run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
		if (channel.id !== channelsId.coins) {
			return interaction.reply({
				ephemeral: true, embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Данная команда доступна только в канале <#${channelsId.coins}>!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			})
		}

		// Если у пользователя есть активное КД на игры, то выдаём ему ошибку!
		if (cooldown.has(author.id)) {
			const dateEnd = new Date(cooldown.get(author.id));
			const minutes = Math.round((
				dateEnd - new Date()
			) / 60000);

			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(`⏳ | Стой-стой!`)
						.setDescription(`**Полегче, друг, хватит пока что азартных игр!\nТы сможешь продолжить через \`${minutes}\` минут!**`)
						.setColor(Colors.Red)
						.setTimestamp()
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			})
		}

		// Количество игр у данного игрока
		const countGame = countGames.get(author.id);
		// Если после этой ставки у человека будет достигнут максимальный лимит игр, то добавляем его в
		// коллекцию с игроками у которых КД.
		if (countGame >= countGamesForCoolDown) {
			const dateEnd = new Date();
			dateEnd.setMinutes(dateEnd.getMinutes() + 5);

			cooldown.set(author.id, dateEnd);
		}

		// переменная в которой содержится тип игры.
		const gameType = args[0];

		// ставка на которую будет идти игра.
		const bet = args[1];

		if (bet < betMin || bet > betMax) {
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Ваша ставка не соответствует норме. Минимальная сумма ставки - \`${betMin}\`. Максимальная сумма ставки - \`${betMax}\`. Ваша ставка: \`${bet}\`**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		const profile = await getCoinsProfile(author.id, guild.id);

		if (profile.coins < bet) {
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**У Вас недостаточно монет для данной операций!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		if (!cooldown.has(author.id)) {
			const countGamesTheUser = countGames.get(author.id) || 0;
			countGames.set(author.id, countGamesTheUser + 1);
		}

		switch (gameType) {
			case "words":
			{
				await words({
					bot, interaction, author, profile, guild, channel, bet
				});
				break;
			}
			case "rockPaperScissors":
			{
				await rockPaperScissors({
					bot, interaction, author, profile, guild, channel, bet
				})
				break;
			}
		}
	}
};
