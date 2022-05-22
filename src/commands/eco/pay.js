const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const { maxPaidOfDay, commissionPercent } = require("../../configs/settings");
const sendUserMessage = require("../../components/sendUserMessage");

module.exports = {
	name: "pay", // название команды
	descr: "Передать деньги другому пользователю", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "пользователь",
			description: "Пользователь которому Вы хотите перевести деньги",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "количество",
			description: `Количество монет которое Вы хотите перевести другому пользователю`,
			type: ApplicationCommandOptionType.Number,
			required: true
		}
	], // аргументы
	perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

	run: async ({ bot, interaction, author, guild, args, channel, channelsId, rolesId }) => {
		if (channel.id !== channelsId.coins) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Данная команда доступна только в канале <#${channelsId.coins}>!**`
						)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			})
		}

		// Пользователь, которому будет идти перевод.
		const member = guild.members.cache.get(args[0]);
		const money = Number(args[1]);
		// Если этот пользователь это вводящий команду, то ошибку отдаём.
		if (member.id === author.id) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Самому себе нельзя перевести деньги!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		// Если сумма перевода ниже минимальной, то выдаём ошибку.
		if (money < 0.001) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Минимальная сумма перевода 0.001!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		// Профиль вводящего команду.
		const profile = await getCoinsProfile(author.id, guild.id);
		// Если монет в профиле меньше чем переводиться, то выдаём ошибку.
		if (profile.coins < money) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**У Вас нет такого количество монет!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		// Если текущий перевод превысит лимит переводов за день на одного человека, то выдаём ошибку.
		if((profile.paidOfDay + money) > maxPaidOfDay){
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setTitle(`📝 | Стой-стой!`)
						.setDescription(`**Полегче друг, твой перевод который ты хочешь осуществить превышает лимит переводов в день - \`${maxPaidOfDay}\`! Снизь немного сумму и всё должно быть в порядке!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		// Если человек достиг максимальной суммы переводов за день, то выдаем ошибку.
		if (profile.paidOfDay >= maxPaidOfDay) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setTitle(`📝 | Стой-стой!`)
						.setDescription(`**Полегче друг, на сегодня хватит переводов. Ты достиг максимального количество которое можно переводить другим пользователям - \`${maxPaidOfDay}\`!**`)
						.setColor(Colors.Red)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		// Комиссия от перевода.
		const commission = (
			(
				(
					money
				) / 100
			) * commissionPercent
		);
		// Сумма, которая будет переводиться(С учётом комиссий).
		const sum = money - commission;

		// Добавляем деньги(с учётом комиссий) пользователю которому пришёл перевод.
		await setUserCoinsParam(member.id, guild.id, 'coins', ({ coins }) => {
			return (
				coins + sum
			).toFixed(4);
		});
		// Отнимаем деньги у того кто перевёл(без учета комиссий)
		await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => {
			return (
				coins - money
			).toFixed(4);
		});
		// Добавляем пользователю который перевёл деньги эту сумму к сегодня переведённым деньгам.
		await setUserCoinsParam(author.id, guild.id, 'paidOfDay', ({ paidOfDay }) => {
			return paidOfDay + money;
		});

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Передача денег!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Вы передали пользователю ${member} - \`${sum.toFixed(4)}\` монет.\n\`${commissionPercent}%\` от общей суммы были отняты комиссией!**`)
					.setAuthor({
						name: guild.name,
						iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		})

		// Отправляем пользователю которому пришли деньги - уведомление.
		const memberProfile = await getCoinsProfile(member.id, guild.id);
		await sendUserMessage({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Звук денег!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Пользователь ${author}(${author.displayName}) перевёл Вам \`${sum}\` монет. Ваш счёт теперь: \`${memberProfile.coins}\`!**`)
					.setAuthor({
						name: guild.name,
						iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		}, member.id, guild);

		// Логируем процесс перевода денег в канал лог-surprisecoins
		const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins);
		const date = new Date();
		logCoinsChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Перевод денег!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Отправитель: <@${author.id}>(${author.id})\nПолучатель: <@${member.id}>(${member.id})\nСумма: \`${money.toFixed(3)}\`$\nКомиссия: \`${commission.toFixed(3)}(${commissionPercent}%)\`**`)
					.setAuthor({
						name: guild.name,
						iconURL: guild.iconURL()
					})
					.addFields([
						{
							name: `${author.user.tag}`,
							value: `Остаток до перевода: \`${(profile.coins).toFixed(3)}\`\nОстаток после перевода: \`${(profile.coins - money).toFixed(3)}\``,
							inline: true,
						},
						{
							name: `${member.user.tag}`,
							value: `Остаток до перевода: \`${(memberProfile.coins).toFixed(3)}\`\nОстаток после перевода: \`${(memberProfile.coins + money).toFixed(3)}\``,
							inline: true,
						},
						{
							name: `Время`,
							value: `\`${date.toLocaleDateString('ru-RU', { timeZone: 'Europe/Moscow' })} ${date.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow' })} \``,
							inline: true,
						}
					])
					.setFooter({
						text: `Robo Hamster`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		})
	}
};
