const { Event, discordUtil: { escapeMarkdown }, MessageEmbed, constants: { MESSAGE_LOGS } } = require('../index');
const { diffWordsWithSpace } = require('diff');

module.exports = class extends Event {

	async run(old, message) {
		// Run monitors
		if (!this.client.ready || old.content === message.content) return;
		this.client.monitors.run(message);

		if (!message.guild || message.author === this.client.user) return;

		const { guild } = message;
		if (!guild.configs.events.messageEdit) return;

		this.client.emit('guildMessageLog', message.channel.nsfw ? MESSAGE_LOGS.kNSFWMessage : MESSAGE_LOGS.kMessage, guild, () => new MessageEmbed()
			.setColor(0xDCE775)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL(), message.url)
			.splitFields(diffWordsWithSpace(escapeMarkdown(old.content), escapeMarkdown(message.content))
				.map(result => result.added ? `**${result.value}**` : result.removed ? `~~${result.value}~~` : result.value)
				.join(' '))
			.setFooter(`${message.language.get('EVENTS_MESSAGE_UPDATE')} | ${message.channel.name}`)
			.setTimestamp());
	}

};
