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
		const resUser = await this.resolveUser(arg);
		if (resUser) return resUser;

		const result = await new FuzzySearch(msg.guild.memberUsernames, (entry) => entry, filter).run(msg, arg);
		if (result) return this.client.users.fetch(result[0]);
		throw msg.language.get('RESOLVER_INVALID_USERNAME', possible.name);
	}

	resolveUser(query) {
		const id = USER_REGEXP.test(query)
			? USER_REGEXP.exec(query)[1]
			: USER_TAG.test(query)
				? this.client.usernames.findKey(tag => tag === query) || null
				: null;

		if (id) return this.client.users.fetch(id);
		return null;
	}

};
