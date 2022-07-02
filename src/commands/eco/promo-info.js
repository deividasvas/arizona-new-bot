const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const { coinsRates: {promocodeMaxJuniperBotLevel, coinsOfActivatePromocode} } = require("../../configs/settings");

module.exports = {
	name: "promo-info", // название команды
	descr: "Информация по промокодам", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [], // аргументы
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
						.setColor(Colors.Blue)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Surprise Bot`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			})
		}

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Информация по промокодам`)
					.setColor(Colors.Blue)
					.setDescription(`**Система промокодов подразумевает собой создание промокода каким-то человеком и дальнейшее его использование новичками или другими людьми.\nЧтобы создать промокод необходимо ввести команду \`/create-promocode #название\` (Можно иметь только один промокод).\n Как только промокод создан - его могут использовать другие люди которые ещё не активировали промокод с помощью команды - \`/promocode\`.\nВ качестве награды выдается некоторое количество монет которые формируются по следующей формуле: \`уровень владельца * 0,1\`(Максимальный уровень который будет считаться - \`${promocodeMaxJuniperBotLevel}\`).\n Автор промокода при вводе его промокода так-же получает сумму равную \`${coinsOfActivatePromocode}\`**`)
					.setAuthor({
						name: guild.name,
						iconURL: guild.iconURL()
					})
					.setFooter({
						text: `Surprise Bot`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		})
	}
};
