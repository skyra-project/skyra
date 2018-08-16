const { Argument, PromptList, klasaUtil: { regExpEsc }, levenshtein } = require('../index');
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
		if (!arg) throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
		if (!msg.guild) return this.role.run(arg, possible, msg);
		const resRole = resolveRole(arg, msg.guild);
		if (resRole) return resRole;

		const lowerCaseArg = arg.toLowerCase();
		const results = [];
		const reg = new RegExp(regExpEsc(lowerCaseArg));

		let lowerCaseName;
		for (const role of msg.guild.roles.values()) {
			lowerCaseName = role.name.toLowerCase();
			if (reg.test(lowerCaseName) || (levenshtein(lowerCaseArg, lowerCaseName, false) !== -1)) {
				results.push(role);
				if (results.length === 10) break;
			}
		}

		switch (results.length) {
			case 0: throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name);
			case 1: return results[0];
			default: return PromptList.run(msg, results.map(role => role.name))
				.then((number) => results[number])
				.catch(() => { throw msg.language.get('RESOLVER_INVALID_ROLENAME', possible.name); });
		}
	}

};
