const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const getCoinsProfile = require("../../components/getCoinsProfile");
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const { coinsRates, maxCountPlatforms } = require("../../configs/settings");

module.exports = {
	name: "buy", // название команды
	descr: "Приобрести товар", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "товар",
			description: "Товар который Вы хотите приобрести",
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: "Платформа",
					value: "platform"
				}
			],
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

		const type = args[0];
		const profile = await getCoinsProfile(author.id, guild.id);
		switch (type) {
			case "platform": {
				if(profile.platforms >= maxCountPlatforms){
					return interaction.reply({
						embeds: [
							await new EmbedBuilder()
								.setTitle(`❌ | Ошибка!`)
								.setDescription(
									`**Вы достигли максимального количества платформ - \`${profile.platforms}\`**`
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
				const platformPrice = coinsRates.startPlatformPrice + (coinsRates.platformCoefficient * profile.platforms);
				if (profile.coins < platformPrice) {
					return interaction.reply({
						embeds: [
							await new EmbedBuilder()
								.setTitle(`❌ | Ошибка!`)
								.setDescription(
									`**У Вас недостаточно монет!\n Необходимо: \`${platformPrice}\`.\n У Вас есть: \`${profile.coins}\`**`
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
				await setUserCoinsParam(author.id, guild.id, "platforms", ({ platforms }) => {
					return platforms + 1;
				})

				await setUserCoinsParam(author.id, guild.id, "coins", ({ coins }) => {
					return (coins - platformPrice).toFixed(4);
				})

				return interaction.reply({
					embeds: [
						new EmbedBuilder()
							.setTitle(`💰 | Успешная покупка!`)
							.setColor(Colors.DarkGreen)
							.setDescription(`**Вы успешно приобрели \`1\` платформу! Теперь у Вас \`${profile.platforms + 1}\` платформ!**`)
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
		}
	}
};
