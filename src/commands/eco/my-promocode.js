const { EmbedBuilder, ApplicationCommandOptionType, Colors } = require("discord.js");
const Promocodes = require("../../models/Promocodes");

module.exports = {
	name: "my-promocode", // название команды
	descr: "Узнать информацию по своему промокоду", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "промокод",
			description: "Название промокода (От JR.D)",
			type: ApplicationCommandOptionType.String,
			required: false
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

		// Роли которым можно смотреть чужие промокоды
		const allowCheckOtherPeopleProfilesRolesId = [
			rolesId.discordMaster,
			rolesId.juniorDiscordMaster
		];


		// Если название промокода передано и ролей у человека нет, то выдаём ему ошибку!
		if (args[0] && !author.roles.cache.some(role => allowCheckOtherPeopleProfilesRolesId.includes(role.id))) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Промокоды других пользователей можно смотреть только от должности <@&${rolesId.juniorDiscordMaster}> и выше!**`)
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
			});
		}
		const promocode = await Promocodes.findOne(args[0] ? {
			guildId: guild.id,
			name: args[0]
		} : {
			guildId: guild.id,
			authorId: author.id
		});
		if (!promocode) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(
							`**Не существует промокода владельцем которого Вы являетесь! Создайте его с помощью команды \`/create-promocode\`**`
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

		interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setTitle(`💰 | ${promocode.name}`)
					.setColor(Colors.Blue)
					.setDescription(`>>> **Название промокода: \`${promocode.name}\`\nВладелец: <@${promocode.authorId}>\nИспользований: \`${promocode.use}\`**`)
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
