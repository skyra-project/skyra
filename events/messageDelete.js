const { Event } = require('../index');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Event {

	run(msg) {
		if (msg.action === 'DELETE') {
			delete msg.action;
			return null;
		}

		this.deleteResponse(msg);

		if (msg.channel.type !== 'text' || msg.author.id === this.client.user.id) return null;

		const settings = msg.guild.settings;
		if (settings.events.messageDelete && settings.channels.messagelogs) return this.sendLog(msg, settings)
			.catch(err => this.handleError(err));
		return null;
	}

	deleteResponse(msg) {
		for (const [key, value] of this.client.commandMessages) {
			if (key === msg.id) {
				value.response.nuke().catch(() => null);
				return this.client.commandMessages.delete(key);
			}

			if (msg.id === value.response.id) {
				return this.client.commandMessages.delete(key);
			}
		}

		return null;
	}

	async sendLog(msg, settings) {
		const channel = msg.guild.channels.get(settings.channels.messagelogs);
		if (!channel) return settings.update({ channels: { messagelogs: null } });

		const i18n = msg.language;

		const embed = new MessageEmbed()
			.setColor(0xFFAB40)
			.setAuthor(`${msg.author.tag} (${msg.author.id})`, msg.author.displayAvatarURL())
			.setDescription(i18n.get('EVENTS_MESSAGE_DELETE_MSG', msg.content))
			.setFooter(`${i18n.get('EVENTS_MESSAGE_DELETE')} | ${msg.channel.name}`)
			.setTimestamp();

		return channel.send({ embed });
	}

	handleError(err) {
		return this.client.emit('log', err, 'error');
	}

};
