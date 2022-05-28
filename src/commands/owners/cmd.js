const {
	EmbedBuilder,
	ApplicationCommandOptionType,
	Colors
} = require("discord.js");
const CommandsDisabled = require("../../models/CommandsDisabled");
module.exports = {
	name: "cmd", // название команды
	descr: "Управление командами", // описание команды
	perms: (rolesId) => [rolesId.discordMaster], // Функция которая возвращает массив с ID ролей которым можно использовать эту команду
	showInSlashCommands: false, // показывать ли команду в slash командах
	arguments: [
		{
			name: "действие",
			description: "Действие которое Вы хотите произвести",
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: "Перезапустить",
					value: "restart"
				},
				{
					name: "Запустить",
					value: "start"
				},
				{
					name: "Остановить",
					value: "stop"
				},
				{
					name: "Перезапустить слэш команды",
					value: "reloadSlash"
				}
			],
			required: true
		},
		{
			name: "команда",
			description: "Название команды с которой Вы производите действия",
			type: ApplicationCommandOptionType.String,
			required: false,
		}
	], // аргументы

	run: async ({
					bot, interaction, args, guild, author, rolesId, channelsId
				}) => {
		const action = args[0];
		const commandName = args[1];

		const command = bot.commands.get(commandName);
		const disabledCommand = await CommandsDisabled.findOne({
			commandName
		});

		if (command?.archive) {
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`❌ | Ошибка!`)
						.setDescription(`**Команда \`${commandName}\` находится в архиве. Взаимодействие возможно только через код путём изменения свойства \`archive\` на \`false\`/\`true\`**`)
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



		if (action === "restart") {
			// делаем рестарт команды
			delete require.cache[
				require.resolve(`../../commands/${command.category}/${command.name}.js`)
				];
			await bot.commands.delete(commandName);
			const props = require(`../../commands/${command.category}/${command.name}.js`);
			await bot.commands.set(command.name, props);
			return interaction.reply({
				ephemeral: true,
				embeds: [
					new EmbedBuilder()
						.setColor(Colors.Blue)
						.setTitle(`📌 | Система управления командами!`)
						.setAuthor({
							name: guild.name,
							iconURL: guild.iconURL()
						})
						.setDescription(
							`**Команда \`${commandName}\` была успешно перезагружена!**`
						)
						.setTimestamp()
						.setFooter({
							text: `Robo Hamster`,
							iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}

		if (action === "start") {

			if (!disabledCommand) {
				return interaction.reply({
					ephemeral: true,
					embeds: [
						await new EmbedBuilder()
							.setTitle(`❌ | Ошибка!`)
							.setDescription(`**Команда \`${commandName}\` не отключена**`)
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
			disabledCommand.remove();

			const command = require(`../${disabledCommand.commandCategory}/${commandName}.js`);
			if (command.showInSlashCommands) {
				await bot.commands.set(command.name, {
					...command,
					category: disabledCommand.commandCategory
				});
				await bot.loadSlashCommand(command, guild);
			}
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`📌 | Запуск команды`)
						.setDescription(`**Команда \`${commandName}\` успешно запущена**`)
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

		if (action === "stop") {
			if (disabledCommand) {
				return interaction.reply({
					ephemeral: true,
					embeds: [
						await new EmbedBuilder()
							.setTitle(`❌ | Ошибка!`)
							.setDescription(
								`**Команда \`${commandName}\` находится в состояний - отключена**`
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
				});
			}

			const command = bot.commands.get(commandName);
			if(!command){
				return interaction.reply({
					ephemeral: true,
					embeds: [
						await new EmbedBuilder()
							.setTitle(`❌ | Ошибка!`)
							.setDescription(
								`**Команды \`${commandName}\` не существует!**`
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
				});
			}
			await bot.commands.delete(commandName);
			const commandGuild = guild.commands.cache.find(
				(cmd) => cmd.name === command.name
			);
			await bot.deleteSlashCommand(commandGuild.id, guild);
			await new CommandsDisabled({
				commandName,
				provocateurId: author.id,
				commandCategory: command.category
			}).save();
			return interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`📌 | Выключение команды`)
						.setDescription(`**Команда \`${commandName}\` успешно выключена**`)
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

		if (action === 'reloadSlash') {
			interaction.reply({
				ephemeral: true,
				embeds: [
					await new EmbedBuilder()
						.setTitle(`📌 | Перезапуск команд`)
						.setDescription(`**Сейчас произойдёт перезапуск ВСЕХ слэш команд!**`)
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
			await bot.deleteAllSlashCommands();
			await bot.command();
			return;
		}
	}
};
