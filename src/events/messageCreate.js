const cache = {};
const CommandsDisabled = require('../models/CommandsDisabled');
const { EmbedBuilder, Colors } = require("discord.js");
const { prefix, developers } = require("../configs/settings");
const parseIdFromMention = require("../components/parseIdFromMention");
const handleErrors = require("../components/handleErrors");
const settings = require("../configs/settings.js");

// Функция для обработки команд
const commandHandler = async (bot, message) => {
	if (message.channel.type === "DM" || message.author.bot) {
		return;
	}
	const rolesId = settings.rolesId[message.guild.id];
	const channelsId = settings.channelsId[message.guild.id];
	const whiteListRoles = settings.whiteListRoles(rolesId);
	const categories = settings.categories[message.guild.id];
	const fromPostToPostList = settings.fromPostToPostList[message.guild.id];
	if (message.content.startsWith(bot.prefix)) {
		// НАСТРОЙКА СЛЭШ КОМАНД НАХОДИТСЯ В interactionCreate.js в условии command.isChatInputCommand()
		const splitedCommand = message.content
			.slice(bot.prefix.length)
			.split(/ +/g);
		const args = splitedCommand.slice(1); // все аргументы
		const commandName = splitedCommand[0]; // название команды
		let command = bot.commands.get(commandName);
		if (!command) {
			return;
		}
		if (await CommandsDisabled.findOne({
			commandName
		}) || command.archive)
		{
			// Проверяем находится ли команда в выключенных или в архиве. Если да, то выдаём ошибку
			return message
				.reply({
					embeds: [
						await new EmbedBuilder()
							.setTitle(`🚫 | Ошибка!`)
							.setDescription(`**Команда \`${commandName}\` отключена!**`)
							.setColor(Colors.DarkRed)
							.setTimestamp()
							.setAuthor({
								name: message.guild.name, iconURL: message.guild.iconURL()
							})
							.setFooter({
								text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
							})
					]
				})
				.then((msg) => setTimeout(() => msg.delete(), 10000));
		}

		// получаем все айдишники ролей которые могут запускать данную команду
		const permissions = [
			...bot.fullPermissionCommandsRolesId(rolesId),
			...(
				await command.perms(rolesId)
			)
		];
		if (!message.member?.roles.cache.some((role) => permissions.includes(role.id)) && !message.member.permissions.has("Administrator")) {
			// если у пользователя нет не одной роли которая может использовать данную команду, то отдаём отказ.
			return message
				.reply({
					embeds: [
						await new EmbedBuilder()
							.setTitle(`🚫 | Ошибка!`)
							.setDescription(`**Вам недоступна данная команда!**`)
							.setColor(Colors.DarkRed)
							.setTimestamp()
							.setAuthor({
								name: message.guild.name, iconURL: message.guild.iconURL()
							})
							.setFooter({
								text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
							})
					]
				})
				.then((msg) => {
					setTimeout(() => {
						msg.delete();
					}, 20000);
				});
		}

		if (args.length < command.arguments.filter((argument) => argument.required === true).length) {
			// если данных аргументов меньше чем минимально необходимо, то выдаём FAQ по команде.
			const commandUse = `\`${prefix}${command.name} ${command.arguments
				.map((arg) => `[${arg.name}]`)
				.join(" ")}\``; // /run []

			return message
				.reply({
					embeds: [
						await new EmbedBuilder()
							.setTitle(`🚫 | Ошибка!`)
							.setDescription(`**Используйте:\n${commandUse}**\n\n**Описание команды:** \`\`\`${command.descr}\`\`\`\n**Аргументы:**\n\`\`\`${command.arguments
								.map(({
										  name,
										  type,
										  required,
										  choices,
										  description
									  }) => `${name} | ${description} | ${bot.typesArguments.find((typeArgument) => typeArgument.type === type).value} - [${required ? "Обязателен" : "Необязателен"}] ${choices?.length > 0 ? `(${choices
									.map((choice) => choice.value)
									.join(" | ")})` : ""}`)
								.join("\n")}\`\`\``)
							.setColor(Colors.DarkGreen)
							.setTimestamp()
							.setFooter({
								text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
							})
					]
				})
				.then((msg) => {
					setTimeout(() => {
						message.delete();
						msg.delete();
					}, 10000);
				});
		}

		for (const index in command.arguments) {
			// проверка валидности аргументов
			const argument = command.arguments[index]; // аргумент и его настройка из команды
			const argumentValue = args[index]; // значение аргумента из команды
			if (!argument.required && !argumentValue) {
				continue;
			}
			const typeArgument = bot.typesArguments.find((typeArgument) => typeArgument.type === argument.type); // тип discord.js аргумента.
			if (!typeArgument.validator(argumentValue, message.guild, message)) {
				// проверяем через валидатор типов аргументов является ли наш аргумент валидным. Если нет, то выкидываем ошибку.
				return message.reply({
					embeds: [
						await new EmbedBuilder()
							.setTitle(`🚫 | Ошибка!`)
							.setDescription(`**Вы неверно указали аргумент \`${argument.name}\`. Необходимо следующее значение: \`${typeArgument.value}\`**`)
							.setColor(Colors.DarkGreen)
							.setAuthor({
								name: message.guild.name, iconURL: message.guild.iconURL()
							})
							.setTimestamp()
							.setTimestamp()
							.setFooter({
								text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
							})
					]
				});
			}
			if (argument.choices) {
				const isValidValueForTheArgument = (value) => {
					for (const choice of argument.choices) {
						if (choice.value === value) {
							return true;
						}
					}
					return false;
				}
				if (!isValidValueForTheArgument(argumentValue)) {
					return message.reply({
						embeds: [
							await new EmbedBuilder()
								.setTitle(`🚫 | Ошибка!`)
								.setDescription(`**Вы указали невалидное значение для аргумента \`${argument.name}\`. Валидные значения: \`${argument.choices.map(choice => choice.value).join(", ")}\`. Ваше значение: \`${argumentValue}\`**`)
								.setColor(Colors.DarkGreen)
								.setAuthor({
									name: message.guild.name, iconURL: message.guild.iconURL()
								})
								.setTimestamp()
								.setTimestamp()
								.setFooter({
									text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
								})
						]
					});
				}
			}
			const idValue = parseIdFromMention(argumentValue);
			if (idValue) {
				// Проверяем, должен ли быть наш аргумент пингом и если разделить строку с помощью начала пинга, то будет
				// ли что-то. Если да, то получаем айдишник при помощи выреза и вставляем вместо аргумента.
				// Производим процессы, чтоб получить айдишник из пинга, и затем, вставляем его вместо аргумента.
				args[index] = idValue;
				continue;
			}
			if (Number(index) === command.arguments.length - 1) {
				// Если этот аргумент последний, то ставим ему дополнительное значение через пробелы.
				// Могут быть указаны параметры и далее, к примеру, причина состоит из трёх и более слов.

				args[index] = args.slice(Number(index)).join(" ");
				continue;
			}
		}

		// Передаётся interaction чтобы команды в случае смены режима с Message на Slash или наоборот работали нормально.
		// Пожалуйста, не меняйте, а следуйте тому что есть

		const reply = async (option) => {
			// Функция для похожего поведения ответа, как и в interaction
			// Сделано для того, чтобы не переписывать по 20 тысяч раз код на message и interaction.
			const answer = await message.reply(option);
			cache[message.id] = answer;
			setTimeout(() => {
				message.delete();
				answer.delete();
				delete cache[message.id];
			}, 20000);
			return answer;
		};

		const editReply = async (option) => {
			// Функция для редактирования ответа похожего как в interaction.
			// Используйте эту функцию вместо .edit чтобы сохранить порядок кода.
			// Сделано чтобы можно было и при вызове через слэш команду, и при вызове через обычную
			// команду отреагировать одинаково
			const answer = cache[message.id];
			if (!answer) return;
			return await answer.edit(option);
		};

		return command
			.run({
				interaction: {
					...message, reply, editReply
				},
				author: message.member,
				guild: message.guild,
				rolesId,
				channelsId,
				whiteListRoles,
				categories,
				fromPostToPostList,
				bot,
				channel: message.channel,
				args,
				developers,
				theSlashCall: false
			})
			.catch((err) => handleErrors(err, bot))
			.then(() => {
				setTimeout(() => {
					if (!cache[message.id]) {
						return message.delete(); // если ответ был дан не через .reply, то удаляем сообщение после завершения работы команды
					}
				}, 2000);
			});
	}
}

module.exports = async (bot, message) => {
	if (message.type === 'DM' || message.author.bot) {
		return;
	}
	// Айди каналов сервера
	const channelsId = settings.channelsId[message.guild.id];
	// Запускаем обработку команд
	await commandHandler(bot, message);

	// Если канал куда отправили сообщение это отправка-анкет, то передаём её в модуль
	if (message.channel.id === channelsId.sendQuestionnaire) {
		bot.modules.get('anketa').run({ bot, message });
	}
	bot.modules.get("trigger").run({ bot, message });
	bot.modules.get("coins").run({ bot, message });
};
