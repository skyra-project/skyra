const { Event, constants: { MESSAGE_LOGS } } = require('../index');

module.exports = class extends Event {


	async run(type, guild, makeMessage) {
		const key = TYPES[type];
		if (!key) {
			this.client.emit('warn', `[EVENT] GuildMessageLog: Unknown type ${type.toString()}`);
			return;
		}

		const id = guild.configs.get(key);
		if (!id) return;

		const channel = guild.channels.get(id);
		if (!channel) {
			await guild.configs.reset(key);
			return;
		}

		try {
			await channel.send(makeMessage());
		} catch (error) {
			this.client.emit('error', `Failed to send ${type.toString()} log for guild ${guild} in channel ${channel.name}`);
		}
	}

};

const TYPES = {
	[MESSAGE_LOGS.kMember]: 'channels.log',
	[MESSAGE_LOGS.kMessage]: 'channels.messagelogs',
	[MESSAGE_LOGS.kModeration]: 'channels.modlog',
	[MESSAGE_LOGS.kNSFWMessage]: 'channels.nsfwmessagelogs'
};
