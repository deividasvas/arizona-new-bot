const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const { maxPaidOfDay, commissionPercent, minLevelDeposit, limitDeposit } = require("../../configs/settings");
const sendUserMessage = require("../../components/sendUserMessage");
const getJuniperBotLevel = require("../../components/getJuniperBotLevel");

const putDeposit = async ({ bot, user, interaction, sum, profile, guild, channelsId }) => {
	if (profile.depositCoins >= limitDeposit) {
		return interaction.reply({
			embeds: [
				await new EmbedBuilder()
					.setTitle(`❌ | Ошибка!`)
					.setDescription(`**На Вашем депозите достигнута максимальная сумма - \`${new Intl.NumberFormat('en-US').format(limitDeposit)}\`!**`)
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

	if ((
		profile.depositCoins + sum
	) >= limitDeposit)
	{
		return interaction.reply({
			embeds: [
				await new EmbedBuilder()
					.setTitle(`❌ | Ошибка!`)
					.setDescription(`**Данное пополнение депозита приведёт к превышению доступного лимита - \`${new Intl.NumberFormat('en-US').format(limitDeposit)}\`!**`)
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

	if (profile.coins < sum) {
		return interaction.reply({
			embeds: [
				await new EmbedBuilder()
					.setTitle(`❌ | Ошибка!`)
					.setDescription(`**У Вас недостаточно средств для пополнения депозита на сумму - \`${sum}\`!**`)
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

	// Комиссия при закидывании денег на депозит.
	const commission = (
		sum / 100
	) * commissionPercent;

	await setUserCoinsParam(user.id, guild.id, 'depositCoins', ({ depositCoins }) => {
		return (
			(
				sum - commission
			) - profile.depositCoins
		).toFixed(4);
	})

	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Пополнение депозита!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Вы успешно пополнили депозит на \`${(
					sum - commission
				).toFixed(4)}!\`\n\`${commissionPercent}%\` было снято комиссией от общей суммы!**`)
				.setAuthor({
					name: guild.name, iconURL: guild.iconURL()
				})
				.setFooter({
					text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
				})
		]
	})

	// Логируем процесс пополнения депозита в канал лог-surprisecoins
	const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins);
	const date = new Date();
	logCoinsChannel.send({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Пополнение депозита!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Пополнил: <@${user.id}>(${user.id})\nСумма: \`${sum.toFixed(4)}\`$\nКомиссия: \`${commission.toFixed(4)}(${commissionPercent}%)\`**`)
				.setAuthor({
					name: guild.name,
					iconURL: guild.iconURL()
				})
				.addFields([
					{
						name: `Остаток до пополнения`,
						value: `\`${profile.depositCoins}\``
					},
					{
						name: `Остаток после пополнения`,
						value: `\`${(
							(
								sum - commission
							) - profile.depositCoins
						).toFixed(4)}\``
					},
					{
						name: `Время`,
						value: `\`${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} \``,
						inline: true
					}
				])
				.setFooter({
					text: `Robo Hamster`,
					iconURL: bot.user.displayAvatarURL()
				})
		]
	})
}


const withdrawMoney = async ({ bot, user, interaction, sum, profile, guild, channelsId }) => {
	// Комиссия при снятиях денег с депозита.
	const commission = (
		sum / 100
	) * commissionPercent;

	if (profile.depositCoins < (sum)) {
		return interaction.reply({
			embeds: [
				await new EmbedBuilder()
					.setTitle(`❌ | Ошибка!`)
					.setDescription(`**У Вас недостаточно средств для снятия с депозита \`${sum}\` монет!**`)
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

	await setUserCoinsParam(user.id, guild.id, 'depositCoins', ({ depositCoins }) => {
		return (depositCoins - sum).toFixed(4)
	})

	await setUserCoinsParam(user.id, guild.id, 'coins', ({ depositCoins }) => {
		return (
			(
				sum - commission
			) + profile.coins
		).toFixed(4);
	})

	interaction.reply({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Снятие денег с депозита!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Вы успешно сняли с депозита сумму \`${(
					sum - commission
				).toFixed(4)}!\`\n\`${commissionPercent}%\` было снято комиссией от общей суммы!**`)
				.setAuthor({
					name: guild.name, iconURL: guild.iconURL()
				})
				.setFooter({
					text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
				})
		]
	})

	// Логируем процесс пополнения депозита в канал лог-surprisecoins
	const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins);
	const date = new Date();
	logCoinsChannel.send({
		embeds: [
			new EmbedBuilder()
				.setTitle(`💰 | Снятие с депозита!`)
				.setColor(Colors.DarkGreen)
				.setDescription(`**Снял: <@${user.id}>(${user.id})\nСумма: \`${sum.toFixed(4)}\`$\nКомиссия: \`${commission.toFixed(4)}(${commissionPercent}%)\`**`)
				.setAuthor({
					name: guild.name,
					iconURL: guild.iconURL()
				})
				.addFields([
					{
						name: `Остаток до пополнения`,
						value: `\`${profile.depositCoins}\``
					},
					{
						name: `Остаток после пополнения`,
						value: `\`${(
							(
								sum - commission
							) - profile.depositCoins
						).toFixed(4)}\``
					},
					{
						name: `Время`,
						value: `\`${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} \``,
						inline: true
					}
				])
				.setFooter({
					text: `Robo Hamster`,
					iconURL: bot.user.displayAvatarURL()
				})
		]
	})
}

module.exports = {
	name: "deposit", // название команды
	descr: "Взаимодействие с депозитом", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "действие",
			description: "Действие которое Вы хотите произвести по отношению к депозиту",
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: "Положить деньги", value: "putMoney"
				},
				{
					name: "Снять деньги", value: `withdrawMoney`
				}
			],
			required: true
		}, {
			name: "количество",
			description: `Количество монет с которыми Вы производите взаимодействие`,
			type: ApplicationCommandOptionType.String,
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

		const profile = await getCoinsProfile(author.id, guild.id);

		if (!profile.isDepositActive) {
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**У Вас неактивна возможность использовать депозит!\nДля активации депозита введите команду \`/active-deposit\`!**`)
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

		const action = args[0];
		const sum = Number(args[1]);

		switch (action) {
			case "putMoney":
			{
				await putDeposit({
					interaction,
					bot,
					guild,
					sum,
					profile,
					user: author,
					channelsId
				});
				break;
			}
			case "withdrawMoney":
			{
				await withdrawMoney({
					interaction,
					bot,
					guild,
					sum,
					profile,
					user: author,
					channelsId
				})
				break;
			}
		}
	}
};
