const { EmbedBuilder, Colors } = require("discord.js");
const handleErrors = require("../components/handleErrors.js");
const { developers } = require("../configs/settings.js");
const settings = require("../configs/settings.js");
const CommandsDisabled = require("../models/CommandsDisabled.js");

module.exports = async (bot, interaction) => {
	if (interaction.isChatInputCommand()) {
		// если это команда, то мы её обрабатываем
		const { commandName, commandId, guild, channelId } = interaction;
		const command = bot.commands.get(commandName);
		if (!bot.inited) {
			return interaction.reply({
				ephemeral: true, embeds: [
					await new EmbedBuilder()
						.setTitle(`🚫 | Ошибка!`)
						.setDescription(`**Ожидайте, происходит инициализация бота...**`)
						.setColor(Colors.Red)
						.setTimestamp()
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}
		if (!command) {
			// Если бот инициализирован, и команды в слэшах нет, то её создание это парадокс.
			// Поэтому, нужно её удалить + сказать что произошёл парадокс
			await bot.deleteSlashCommand(interaction.commandId, guild);
			return interaction.reply({
				ephemeral: true, embeds: [
					await new EmbedBuilder()
						.setTitle(`🚫 | Упс!`)
						.setDescription(`**Произошёл некоторый парадокс. Команда была создана случайно. Повторите попытку с другой командой!**`)
						.setColor(Colors.Red)
						.setTimestamp()
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}
		if (await CommandsDisabled.findOne({
			commandName
		}) || command.archive)
		{
			// Проверяем находится ли команда в выключенных или в архиве. Если да, то выдаём ошибку
			await bot.deleteSlashCommand(commandId, guild);
			return interaction.reply({
				ephemeral: true, embeds: [
					await new EmbedBuilder()
						.setTitle(`🚫 | Ошибка!`)
						.setDescription(`**Команда \`${commandName}\` отключена!**`)
						.setColor(Colors.DarkRed)
						.setTimestamp()
						.setAuthor({
							name: guild.name, iconURL: guild.iconURL()
						})
						.setFooter({
							text: `Robo Hamster`, iconURL: bot.user.displayAvatarURL()
						})
				]
			});
		}
		const args = interaction.options._hoistedOptions.map((arg) => arg.value);
		const author = interaction.member;
		const channel = interaction.guild.channels.cache.get(channelId) || (
			await interaction.guild.channels.fetch(channelId)
		);
		const rolesId = settings.rolesId[guild.id];
		const channelsId = settings.channelsId[guild.id];
		const whiteListRoles = settings.whiteListRoles(rolesId);
		const categories = settings.categories[guild.id];
		const fromPostToPostList = settings.fromPostToPostList(rolesId);
		return command
			.run({
				interaction,
				whiteListRoles,
				categories,
				rolesId,
				channelsId,
				author,
				guild,
				bot,
				fromPostToPostList,
				channel,
				args,
				developers,
				theSlashCall: true
			})
			.then(async () => {
				try {
					// Автоматическое удаление ответа через 20 секунд.
					const replyMessage = await interaction.fetchReply();
					// Если ответа нет или этот ответ только для одного пользователя, то ничего не делаем.
					if (!replyMessage) {
						return;
					}

					// Если это сообщение видно всем и канал не койнов, то удаляем его через 20 секунд.
					if(!interaction.ephemeral && channel.id !== channelsId.coins){
						setTimeout(() => {
							interaction.deleteReply();
						}, 20000)
					}
				} catch(e){
					return;
				}
			})
			.catch((err) => handleErrors(err, bot));
	}
	if (interaction.isButton()) {
		// если это кнопка, то передаём её модулям
		for (const module of bot.modules.values()) {
			// берём все модули и смотрим в каком принимаются айдишники которые нам нужны
			const { acceptCustomsId } = module;
			if (acceptCustomsId.includes(interaction.customId)) {
				const { member, user, guild, message } = interaction;
				module.run({ bot, member, user, interaction, guild, message }); // запускаем модуль
			}
		}
	}
}
;
