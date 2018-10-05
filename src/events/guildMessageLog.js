const { Event, constants: { MESSAGE_LOGS }, DiscordAPIError, HTTPError } = require('../index');

module.exports = class extends Event {


	async run(type, guild, makeMessage) {
		const key = TYPES[type];
		if (!key) {
			this.client.emit('warn', `[EVENT] GuildMessageLog: Unknown type ${type.toString()}`);
			return;
		}

		const id = guild.settings.get(key);
		if (!id) return;

		const channel = guild.channels.get(id);
		if (!channel) {
			await guild.settings.reset(key);
			return;
		}

		try {
			await channel.send(makeMessage());
		} catch (error) {
			this.client.emit('error', error instanceof DiscordAPIError || error instanceof HTTPError
				? `Failed to send ${type.toString()} log for guild ${guild} in channel ${channel.name}. Error: [${error.code} - ${error.method} | ${error.path}] ${error.message}`
				: `Failed to send ${type.toString()} log for guild ${guild} in channel ${channel.name}. Error: ${error.message}`);
		}
	}

};

const TYPES = {
	[MESSAGE_LOGS.kMember]: 'channels.log',
	[MESSAGE_LOGS.kMessage]: 'channels.messagelogs',
	[MESSAGE_LOGS.kModeration]: 'channels.modlog',
	[MESSAGE_LOGS.kNSFWMessage]: 'channels.nsfwmessagelogs'
};
