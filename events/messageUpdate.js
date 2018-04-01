const { Event } = require('../index');
const { diffWordsWithSpace } = require('diff');
const { Util: { escapeMarkdown } } = require('discord.js');

module.exports = class extends Event {

	async run(old, message) {
		// Run monitors
		if (!this.client.ready || old.content === message.content) return;
		this.client.monitors.run(message, true);

		if (!message.guild || message.author === this.client.user) return;

		const { guild } = message;
		if (!guild.configs.events.messageEdit || !guild.configs.channels.messagelogs) return;
		const channel = guild.channels.get(guild.configs.channels.messagelogs);
		if (!channel) {
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

			const embed = new this.client.methods.Embed()
				.setColor(0xDCE775)
				.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
				.splitFields(text)
				.setFooter(`${language.get('EVENTS_MESSAGE_UPDATE')} | ${message.channel.name}`)
				.setTimestamp();

			await channel.send({ embed });
		}
	}

};
