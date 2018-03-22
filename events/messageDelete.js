const { Event } = require('klasa');

module.exports = class extends Event {

	async run(message) {
		if (message.command && message.command.deletable) for (const msg of message.responses) msg.delete();
		if (!message.guild || message.author === this.client.user) return;

		const { guild } = message;
		if (!guild.configs.events.messageDelete || !guild.configs.channels.messagelogs) return;
		const channel = guild.channels.get(guild.configs.channels.messagelogs);
		if (!channel) {
			await guild.configs.reset('channels.messagelogs');
		} else {
			const { author, content, language } = message;

			const embed = new this.client.methods.Embed()
				.setColor(0xFFAB40)
				.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
				.setDescription(language.get('EVENTS_MESSAGE_DELETE_MSG', content))
				.setFooter(`${language.get('EVENTS_MESSAGE_DELETE')} | ${message.channel.name}`)
				.setTimestamp();

			await channel.send({ embed });
		}
	}

};
