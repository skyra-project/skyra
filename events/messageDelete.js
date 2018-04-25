const { Event, util: { getContent, getImage } } = require('../index');

module.exports = class extends Event {

	async run(message) {
		if (message.command && message.command.deletable) for (const msg of message.responses) msg.nuke();
		if (!message.guild || message.author === this.client.user) return;

		const { guild } = message;
		if (!guild.configs.events.messageDelete || !guild.configs.channels.messagelogs) return;
		const channel = guild.channels.get(guild.configs.channels.messagelogs);
		if (!channel || !channel.postable) {
			await guild.configs.reset('channels.messagelogs');
		} else {
			const { author, language } = message;

			const embed = new this.client.methods.Embed()
				.setColor(0xFFAB40)
				.setAuthor(`${author.tag} (${author.id})`, author.displayAvatarURL())
				.setDescription(language.get('EVENTS_MESSAGE_DELETE_MSG', getContent(message) || ''))
				.setFooter(`${language.get('EVENTS_MESSAGE_DELETE')} • ${message.channel.name}`)
				.setImage(getImage(message))
				.setTimestamp();

			try {
				await channel.send({ embed });
			} catch (error) {
				this.client.emit('error', `Failed to send MessageDelete log for guild ${channel.guild} in channel ${channel.name}`);
			}
		}
	}

};
