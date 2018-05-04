const { Event, Util: { escapeMarkdown }, MessageEmbed } = require('../index');
const { diffWordsWithSpace } = require('diff');

module.exports = class extends Event {

	async run(old, message) {
		// Run monitors
		if (!this.client.ready || old.content === message.content) return;
		this.client.monitors.run(message, true);

		if (!message.guild || message.author === this.client.user) return;

		const { guild } = message;
		if (!guild.configs.events.messageEdit || !guild.configs.channels.messagelogs) return;
		const channel = guild.channels.get(guild.configs.channels.messagelogs);
		if (!channel || !channel.postable) {
			await guild.configs.reset('channels.messagelogs');
		} else {
			const { author, language } = message;

			const result = diffWordsWithSpace(escapeMarkdown(old.content), escapeMarkdown(message.content));
			let text = '';
			for (let i = 0; i < result.length; i++) {
				if (result[i].added === true) text += `**${result[i].value}**`;
				else if (result[i].removed === true) text += `~~${result[i].value}~~`;
				else text += result[i].value;
			}

			const embed = new MessageEmbed()
				.setColor(0xDCE775)
				.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
				.splitFields(text)
				.setFooter(`${language.get('EVENTS_MESSAGE_UPDATE')} | ${message.channel.name}`)
				.setTimestamp();

			try {
				await channel.send({ embed });
			} catch (error) {
				this.client.emit('error', `Failed to send MessageUpdate log for guild ${channel.guild} in channel ${channel.name}`);
			}
		}
	}

};
