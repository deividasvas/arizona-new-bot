const { ApplicationCommandOptionType, EmbedBuilder, Colors } = require("discord.js");
const CoinsUsers = require('../../models/CoinsUsers');
const setUserCoinsParam = require("../../components/setUserCoinsParam");
const { channelsId } = require('../../configs/settings')

const choices = [
	{
		name: 'Монеты',
		value: 'coins'
	},
	{
		name: 'Платформы',
		value: 'platforms'
	},
	{
		name: 'Количество монет , переданных за последний день',
		value: 'paidOfDay'
	},
	{
		name: 'Промокод',
		value: 'promocode'
	},
	{
		name: 'Деньги на депозите',
		value: 'depositCoins'
	},
	{
		name: 'Статус депозита',
		value: 'isDepositActive'
	}
]

module.exports = {
	name: "set-profile", // название команды
	descr: "Изменить значение профиля пользователя", // описание команды
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "пользователь",
			description: "Пользователь, которому вы хотите сменить статистику",
			type: ApplicationCommandOptionType.User,
			required: true
		},
		{
			name: "параметр",
			description: "Параметр, который вы хотите изменить пользователю",
			type: ApplicationCommandOptionType.String,
			required: true,
			choices
		},
		{
			name: "значение",
			description: "Значение, которое вы хотите сменить параметру",
			type: ApplicationCommandOptionType.String,
			required: true
		}
	], // аргументы
	perms: (rolesId) => [
		rolesId.discordMaster,
		rolesId.juniorDiscordMaster
	], // Функция, которая возвращает массив с ID ролей которым можно использовать эту команду
	run: async ({ bot, interaction, guild, args, channelsId }) => {
		const member = guild.members.cache.get(args[0]) ||
			await guild.members.cache.fetch(args[0])

		const user = await CoinsUsers.findOne({
			userId: member.id
		});

		if (!user) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Пользователь ${member} не был найден в базе данных!**`)
						.setColor(Colors.Blue)
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Surprise Bot`, iconURL: bot.user.displayAvatarURL()
						})
				]
			})
		}
		const key = args[1];
		await setUserCoinsParam(member.id, guild.id, key, args[2]);

		interaction.reply({
			ephemeral: true,
			embeds: [
				new EmbedBuilder()
					.setTitle(`🔫 | Изменение профиля пользователя`)
					.setDescription(`**Вы изменили параметр в статистике пользователя ${member} - \`${args[1]}\` на \`${args[2]}\`**`)
					.setColor(Colors.Blurple)
					.setFooter({
						text: `Surprise Bot`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		})

		const logCoinsChannel = guild.channels.cache.get(channelsId.logCoins);
		logCoinsChannel.send({
			embeds: [
				new EmbedBuilder()
					.setAuthor({
						name: `${guild.name}`,
						iconURL: guild.iconURL()
					})
					.setTitle(`📁 | Изменение параметра профиля`)
					// .setDescription(`**${interaction.user} изменил параметр в статистике пользователя ${member} - \`${args[1]}\` на \`${args[2]}\`**`)
					.setDescription(`**⌊📤⌉ Модератор: ${interaction.user}  \`[ID]: ${interaction.user.id}\`\n⌊📥⌉ Пользователь: ${member} \`[ID]: ${interaction.user.id}\`\n⌊✏️⌉ Параметр: \`${args[1]}\`\n⌊📉⌉ Значение: \`${args[2]}\`**`)
					.addFields([
						{
							name: 'Время',
							value: `\`${new Date().toLocaleTimeString('ru-RU')}\``,
							inline: false
						}
					])
					.setColor(Colors.Blurple)
					.setTimestamp()
					.setFooter({
						text: `Surprise Bot`,
						iconURL: bot.user.displayAvatarURL()
					})
			]
		})
	}
}