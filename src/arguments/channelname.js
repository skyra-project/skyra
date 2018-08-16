const { Argument, PromptList, klasaUtil: { regExpEsc }, levenshtein } = require('../index');
const CHANNEL_REGEXP = /^(?:<#)?(\d{17,19})>?$/;

function resolveChannel(query, guild) {
	if (CHANNEL_REGEXP.test(query)) return guild.channels.get(CHANNEL_REGEXP.exec(query)[1]);
	return null;
}

module.exports = class extends Argument {

	get channel() {
		return this.store.get('channel');
	}

	async run(arg, possible, msg) {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
		if (!msg.guild) return this.channel.run(arg, possible, msg);
		const resChannel = resolveChannel(arg, msg.guild);
		if (resChannel) return resChannel;

		const lowerCaseArg = arg.toLowerCase();
		const results = [];
		const reg = new RegExp(regExpEsc(lowerCaseArg));

		let lowerCaseName;
		for (const channel of msg.guild.channels.values()) {
			lowerCaseName = channel.name.toLowerCase();
			if (reg.test(lowerCaseName) || (levenshtein(lowerCaseArg, lowerCaseName, false) !== -1)) {
				results.push(channel);
				if (results.length === 10) break;
			}
		}

		switch (results.length) {
			case 0: throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name);
			case 1: return results[0];
			default: return PromptList.run(msg, results.map(channel => channel.name))
				.then(number => results[number])
				.catch(() => { throw msg.language.get('RESOLVER_INVALID_CHANNELNAME', possible.name); });
		}
	}

};
