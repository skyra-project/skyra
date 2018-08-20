const { Argument, FuzzySearch } = require('../index');
const CHANNEL_REGEXP = /^(?:<#)?(\d{17,19})>?$/;

module.exports = class extends Argument {

	get channel() {
		return this.store.get('channel');
	}

	async run(arg, possible, msg, filter) {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
		if (!msg.guild) return this.channel.run(arg, possible, msg);
		const resChannel = this.resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const result = await new FuzzySearch(msg.guild.channels, (entry) => entry.name, filter).run(msg, arg);
		if (result) return result[1];
		throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
	}

	resolveChannel(query, guild) {
		if (CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)[1]);
		return null;
	}

};
