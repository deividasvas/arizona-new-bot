const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const Promocodes = require('../../models/Promocodes');

module.exports = {
	name: "create-promocode", // название команды
	descr: "Создать собственный промокод", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "название",
			description: "Название промокода(Должен начинаться с #)",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	], // аргументы
	perms: (rolesId) => [rolesId.everyone], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду

	run: async ({ bot, interaction, author, guild, args, channel, channelsId }) => {
		// Делаем данную команду доступной только в канале coins
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


		const promoName = args[0];
		const regex = /\w+/;
		if (!promoName.startsWith("#") || !regex.test(promoName)) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Промокод должен начинаться с # и в нём должны содержаться только английские символы!**`
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
		const name = args[0];
		// Проверяем, существует ли уже такой промокод.
		if (await Promocodes.findOne({
			name,
			guildId: guild.id
		}))
		{
			// Если существует, то выдаём ошибку.
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Промокод \`${name}\` уже существует на этом сервере!**`
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
		if (await Promocodes.findOne({
			authorId: author.id,
			guildId: guild.id
		}))
		{
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**У Вас уже существует промокод!**`
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

		const newPromocode = new Promocodes({
			guildId: guild.id, // айди сервера, где находится пользователь
			name: promoName, // название промокода
			use: 0, // количество использовании
			authorId: author.id // айди автора
		})
		await newPromocode.save();

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Промокод создан!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Вы успешно создали прокомод - \`${promoName}\`. Чтобы узнать подробности использования промокода - введите команду \`/promo-info\`**`)
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

		const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins);
		const date = new Date();
		logCoinsChannel.send({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Создание промокода!`)
					.setColor(Colors.DarkGreen)
					.setAuthor({
						name: guild.name,
						iconURL: guild.iconURL()
					})
					.addFields([
						{
							name: `Владелец`,
							value: `${author.user.tag}`
						},
						{
							name: `Название`,
							value: `${promoName}`
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
};
