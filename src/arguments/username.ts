const { Argument, FuzzySearch } = require('../index');
const USER_REGEXP = /^(?:<@!?)?(\d{17,19})>?$/;
const USER_TAG = /^\w{1,32}#\d{4}$/;

module.exports = class extends Argument {

	get user() {
		return this.store.get('user');
	}

	async run(arg, possible, msg, filter) {
		if (!arg) throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
		if (!msg.guild) return this.user.run(arg, possible, msg);
		const resUser = await this.resolveUser(arg, msg.guild);
		if (resUser) return resUser;

		const result = await new FuzzySearch(msg.guild.nameDictionary, (entry) => entry, filter).run(msg, arg);
		if (result) return this.client.users.fetch(result[0]);
		throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
	}

	resolveUser(query, guild) {
		if (USER_REGEXP.test(query)) return guild.client.users.fetch(USER_REGEXP.exec(query)[1]).catch(() => null);
		if (USER_TAG.test(query)) {
			const res = guild.members.find(member => member.user.tag === query);
			return res ? res.user : null;
		}
		return null;
	}

};
