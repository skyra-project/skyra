const { Argument, PromptList, klasaUtil: { regExpEsc }, levenshtein } = require('../index');
const USER_REGEXP = /^(?:<@!?)?(\d{17,19})>?$/;
const USER_TAG = /^\w{1,32}#\d{4}$/;

function resolveUser(query, guild) {
	if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)[1]).catch(() => null);
	if (USER_TAG.test(query)) {
		const res = guild.members.find(member => member.user.tag === query);
		return res ? res.user : null;
	}
	return null;
}

module.exports = class extends Argument {

	get user() {
		return this.store.get('user');
	}

	async run(arg, possible, msg) {
		if (!msg.guild) return this.user.run(arg, possible, msg);
		const resUser = await resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const lowerCaseArg = arg.toLowerCase();
		const results = [];
		const reg = new RegExp(regExpEsc(lowerCaseArg));

		let lowerCaseNick;
		for (const [id, nickname] of msg.guild.nameDictionary.entries()) {
			if (typeof nickname !== 'string') continue;
			lowerCaseNick = nickname.toLowerCase();
			if (reg.test(lowerCaseNick) || (levenshtein(lowerCaseArg, lowerCaseNick, false) !== -1)) {
				results.push([id, nickname]);
				if (results.length === 10) break;
			}
		}

		switch (results.length) {
			case 0: throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
			case 1: return this.client.users.fetch(results[0][0]);
			default: return PromptList.run(msg, results.map(result => result[1]))
				.then((number) => this.client.users.fetch(results[number][0]))
				.catch(() => { throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name); });
		}
	}

};
