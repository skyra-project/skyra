const { Task, MessageEmbed } = require('../index');

module.exports = class extends Task {

	async run() {
		const { guilds } = this.client;
		for (const task of this.client.schedule.tasks) {
			if (task.taskName !== 'giveaway') continue;

			const { data } = task;

			const guild = guilds.get(data.guildID);
			if (!guild) {
				await task.delete();
				continue;
			}

			const channel = guild.channels.get(data.channelID);
			if (!channel) {
				await task.delete();
				continue;
			}

			await this.editMessage(task, data.channelID, data.messageID, this.createMessage(guild, data.title, data.timestamp));
		}
	}

	async editMessage(task, channelID, messageID, { content, embed }) {
		try {
			await this.client.api.channels[channelID].messages[messageID].patch({
				data: {
					content,
					embed: embed._apiTransform()
				}
			});
		} catch (_) {
			await task.delete();
		}
	}

	createMessage(guild, title, timestamp) {
		const { language } = guild;
		return {
			content: language.get('GIVEAWAY_TITLE'),
			embed: new MessageEmbed()
				.setColor(0x49C6F7)
				.setTitle(title)
				.setDescription(language.get('GIVEAWAY_DURATION', timestamp - Date.now()))
				.setFooter(language.get('GIVEAWAY_ENDS_AT'))
				.setTimestamp(new Date(timestamp))
		};
	}

};
