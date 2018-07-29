const { Argument, PromptList, klasaUtil: { regExpEsc } } = require('../index');
const ROLE_REGEXP = /^(?:<@&)?(\d{17,19})>?$/;

function resolveRole(query, guild) {
	if (ROLE_REGEXP.test(query)) return guild.roles.get(ROLE_REGEXP.exec(query)[1]);
	return null;
}

module.exports = class extends Argument {

	get role() {
		return this.store.get('role');
	}

	async run(arg, possible, msg) {
		if (!msg.guild) return this.role(arg, possible, msg);
		const resRole = resolveRole(arg, msg.guild);
		if (resRole) return resRole;

		const results = [];
		const reg = new RegExp(regExpEsc(arg), 'i');
		for (const role of msg.guild.roles.values()) if (reg.test(role.name)) results.push(role);

		let querySearch;
		if (results.length > 1) {
			const regWord = new RegExp(`\\b${regExpEsc(arg)}\\b`, 'i');
			const filtered = results.filter(role => regWord.test(role.name));
			querySearch = filtered.length > 0 ? filtered : results;
		} else {
			querySearch = results;
		}

		switch (querySearch.length) {
			case 0: throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
			case 1: return querySearch[0];
			default: return PromptList.run(msg, querySearch.slice(0, 10).map(role => role.name))
				.then(number => querySearch[number])
				.catch(() => { throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name); });
		}
	}

};
