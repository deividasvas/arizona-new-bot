const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const Promocodes = require('../../models/Promocodes');
const getJuniperBotLevel = require("../../components/getJuniperBotLevel");
const { promocodeMaxJuniperBotLevel, coinsOfActivatePromocode, coinsOfActivatePromocodeOwner } = require("../../configs/settings");
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const sendUserMessage = require("../../components/sendUserMessage");
module.exports = {
	name: "promocode", // название команды
	descr: "Использовать промокод", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "промокод",
			description: "Название промокода которое Вы хотите активировать(Должен начинаться с #)",
			type: ApplicationCommandOptionType.String,
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
		const promocodeName = args[0];
		if (!promocodeName.startsWith('#')) {
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Промокод должен начинаться с #!**`
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

		const profile = await getCoinsProfile(author.id, guild.id);
		if (profile.promocode.activate) {
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Вы уже активировали промокод!**`
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
		const promocode = await Promocodes.findOne({
			name: promocodeName,
			guildId: guild.id
		});
		if (!promocode) {
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Данного промокода не существует!**`
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

		if(promocode.authorId === author.id){
			return interaction.reply({
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Свой промокод нельзя активировать!**`
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

		// Уровень владельца промокода в juniperbot
		const _authorPromocodeLevel = await getJuniperBotLevel(bot, promocode.authorId, promocode.guildId);

		// Если уровень больше допустимого в системе coins, то ставим который максимально разрешен, в ином случае тот который у пользователя
		const level = _authorPromocodeLevel > promocodeMaxJuniperBotLevel ? promocodeMaxJuniperBotLevel : _authorPromocodeLevel;

		// Количество монет которое будет выдано пользователю за активацию промокода.
		const sumCoins = level * coinsOfActivatePromocode || coinsOfActivatePromocode;

		// Количество уровней которое будет выдано пользователю за активацию промокода.
		const sumLevel = Math.ceil(level * coinsOfActivatePromocode || coinsOfActivatePromocode);

		// Выдаем награду пользователю за использование промокода
		await setUserCoinsParam(author.id, guild.id, 'coins', ({ coins }) => (
			coins + sumCoins
		).toFixed(4));
		await setUserCoinsParam(author.id, guild.id, 'promocode', {
			name: promocodeName,
			dateActivate: new Date(),
			activate: true
		});

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Активация промокода!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Вы успешно активировали промокод \`${promocodeName}\`!\nВам было начислено: \`${sumCoins.toFixed(4)}\` монет!\nОбратитесь в канал <#${channelsId.support}> для выдачи Вам дополнительных \`${sumLevel}\` уровней за активацию промокода.**`)
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

		// Добавляем промокоду одно использование
		await Promocodes.updateOne({
			name: promocodeName,
			guildId: guild.id
		}, {
			use: promocode.use + 1
		})

		await setUserCoinsParam(promocode.authorId, promocode.guildId, "coins", ({ coins }) => (
			coins + coinsOfActivatePromocodeOwner
		).toFixed(4));


		await sendUserMessage({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Активация промокода!`)
					.setColor(Colors.DarkGreen)
					.setDescription(`**Пользователь ${author}(${author.displayName}) активировал Ваш промокод \`${promocode.name}\`.\nВам начислено \`${coinsOfActivatePromocodeOwner}\` монет!**`)
					.setAuthor({
						name: guild.name,
						iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Robo Hamster`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		}, promocode.authorId, guild);
	}
};
