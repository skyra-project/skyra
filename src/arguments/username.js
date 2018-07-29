const { Argument, PromptList, klasaUtil: { regExpEsc } } = require('../index');
const USER_REGEXP = /^(?:<@!?)?(\d{17,19})>?$/;

function resolveUser(query, guild) {
	if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)[1]).catch(() => null);
	if (/^\w{1,32}#\d{4}$/.test(query)) {
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
		if (!msg.guild) return this.user(arg, possible, msg);
		const resUser = await resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const member of msg.guild.members.values())
			if (reg.test(member.user.username)) results.push(member.user);

		let querySearch;
		if (results.length > 1) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(user => regWord.test(user.username));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
			case 1: return querySearch[0];
			default: return PromptList.run(msg, querySearch.slice(0, 10).map(user => user.username))
				.then(number => querySearch[number])
				.catch(() => { throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name); });
		}
	}

};
