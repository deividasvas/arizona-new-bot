const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const Promocodes = require('../../models/Promocodes');
const { promocodeMaxJuniperBotLevel, coinsOfActivatePromocode } = require("../../configs/settings");

module.exports = {
	name: "promo-leaders", // название команды
	descr: "Лидеры промокоды", // описание команды
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
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			})
		}

		const promocodes =
			(
				await Promocodes.find({
						guildId: guild.id
					}
				).sort((promocodeA, promocodeB) => {
					return promocodeB.use - promocodeA.use;
				})
			).slice(0, 10);

		const answer = promocodes.map((promocode, index) => {
			return `${index + 1} | ${promocode.name} | <@${promocode.authorId}> | ${Math.floor(promocode.use)}`;
		});
		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | Топ 10 промокодов лидеров`)
					.setColor(Colors.Blue)
					.setDescription(`**\`Индекс | Имя | Владелец | Кол-во использований\`\n${answer.join('\n')}**`)
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
};
