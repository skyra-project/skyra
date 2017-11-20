const Resolver = require('./Resolver');

class ArgResolver extends Resolver {

	piece(arg, currentUsage, possible, repeat, msg) {
		const piece = this.client.commands.get(arg)
			|| this.client.events.get(arg)
			|| this.client.extendables.get(arg)
			|| this.client.finalizers.get(arg)
			|| this.client.inhibitors.get(arg)
			|| this.client.languages.get(arg)
			|| this.client.monitors.get(arg);
		if (piece) return Promise.resolve(piece);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'piece'));
	}

	command(arg, currentUsage, possible, repeat, msg) {
		const command = this.client.commands.get(arg);
		if (command) return Promise.resolve(command);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'command'));
	}

	event(arg, currentUsage, possible, repeat, msg) {
		const event = this.client.events.get(arg);
		if (event) return Promise.resolve(event);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'event'));
	}

	extendable(arg, currentUsage, possible, repeat, msg) {
		const extendable = this.client.extendables.get(arg);
		if (extendable) return Promise.resolve(extendable);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'extendable'));
	}

	finalizer(arg, currentUsage, possible, repeat, msg) {
		const finalizer = this.client.finalizers.get(arg);
		if (finalizer) return Promise.resolve(finalizer);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'finalizer'));
	}

	inhibitor(arg, currentUsage, possible, repeat, msg) {
		const inhibitor = this.client.inhibitors.get(arg);
		if (inhibitor) return Promise.resolve(inhibitor);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'inhibitor'));
	}

	monitor(arg, currentUsage, possible, repeat, msg) {
		const monitor = this.client.monitors.get(arg);
		if (monitor) return Promise.resolve(monitor);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'monitor'));
	}

	language(arg, currentUsage, possible, repeat, msg) {
		const language = this.client.languages.get(arg);
		if (language) return Promise.resolve(language);
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_PIECE', currentUsage.possibles[possible].name, 'language'));
	}

	async message(arg, currentUsage, possible, repeat, msg) {
		const message = await super.msg(arg, msg.channel);
		if (message) return message;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_MSG', currentUsage.possibles[possible].name);
	}

	async user(arg, currentUsage, possible, repeat, msg) {
		const user = await super.user(arg);
		if (user) return user;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_USER', currentUsage.possibles[possible].name);
	}

	async advuser(arg, currentUsage, possible, repeat, msg) {
		if (!arg && currentUsage.type !== 'optional') return null;
		const user = await super.advUser(arg, msg);
		if (user) return user;
		throw msg.language.get('RESOLVER_INVALID_USER', currentUsage.possibles[possible].name);
	}

	async member(arg, currentUsage, possible, repeat, msg) {
		const member = await super.member(arg, msg.guild);
		if (member) return member;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_MEMBER', currentUsage.possibles[possible].name);
	}

	async advmember(arg, currentUsage, possible, repeat, msg) {
		if (!arg && currentUsage.type !== 'optional') return null;
		const member = await super.advMember(arg, msg);
		if (member) return member;
		throw msg.language.get('RESOLVER_INVALID_MEMBER', currentUsage.possibles[possible].name);
	}

	async channel(arg, currentUsage, possible, repeat, msg) {
		const channel = await super.channel(arg, msg.guild);
		if (channel) return channel;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_CHANNEL', currentUsage.possibles[possible].name);
	}

	async advchannel(arg, currentUsage, possible, repeat, msg) {
		if (!arg && currentUsage.type !== 'optional') return null;
		const channel = await super.advChannel(arg, msg);
		if (channel) return channel;
		throw msg.language.get('RESOLVER_INVALID_CHANNEL', currentUsage.possibles[possible].name);
	}

	async guild(arg, currentUsage, possible, repeat, msg) {
		const guild = await super.guild(arg);
		if (guild) return guild;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_GUILD', currentUsage.possibles[possible].name);
	}

	async role(arg, currentUsage, possible, repeat, msg) {
		const role = await super.role(arg, msg.guild);
		if (role) return role;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_ROLE', currentUsage.possibles[possible].name);
	}

	async advrole(arg, currentUsage, possible, repeat, msg) {
		if (!arg && currentUsage.type !== 'optional') return null;
		const role = await super.advRole(arg, msg);
		if (role) return role;
		throw msg.language.get('RESOLVER_INVALID_ROLE', currentUsage.possibles[possible].name);
	}

	literal(arg, currentUsage, possible, repeat, msg) {
		if (arg.toLowerCase() === currentUsage.possibles[possible].name.toLowerCase()) return Promise.resolve(arg.toLowerCase());
		if (currentUsage.type === 'optional' && !repeat) return Promise.resolve(null);
		return Promise.reject(msg.language.get('RESOLVER_INVALID_LITERAL', currentUsage.possibles[possible].name));
	}

	async boolean(arg, currentUsage, possible, repeat, msg) {
		const boolean = await super.boolean(arg);
		if (boolean !== null) return boolean;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_BOOL', currentUsage.possibles[possible].name);
	}

	string(arg, currentUsage, possible, repeat, msg) {
		const { min, max } = currentUsage.possibles[possible];
		if (ArgResolver.minOrMax(arg.length, min, max, currentUsage, possible, repeat, msg, msg.language.get('RESOLVER_STRING_SUFFIX')))
			return Promise.resolve(arg);
		return Promise.resolve(null);
	}

	async integer(arg, currentUsage, possible, repeat, msg) {
		const { min, max } = currentUsage.possibles[possible];
		arg = await super.integer(arg);
		if (arg === null) {
			if (currentUsage.type === 'optional' && !repeat) return null;
			throw msg.language.get('RESOLVER_INVALID_INT', currentUsage.possibles[possible].name);
		}
		if (ArgResolver.minOrMax(arg, min, max, currentUsage, possible, repeat, msg)) return arg;
		return null;
	}

	async float(arg, currentUsage, possible, repeat, msg) {
		const { min, max } = currentUsage.possibles[possible];
		arg = await super.float(arg);
		if (arg === null) {
			if (currentUsage.type === 'optional' && !repeat) return null;
			throw msg.language.get('RESOLVER_INVALID_FLOAT', currentUsage.possibles[possible].name);
		}
		if (ArgResolver.minOrMax(arg, min, max, currentUsage, possible, repeat, msg)) return arg;
		return null;
	}

	async url(arg, currentUsage, possible, repeat, msg) {
		const hyperlink = await super.url(arg);
		if (hyperlink !== null) return hyperlink;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_URL', currentUsage.possibles[possible].name);
	}

	async attachment(arg, currentUsage, possible, repeat, msg) {
		const message = await super.attachment(arg, msg);
		if (message) return message;
		if (currentUsage.type === 'optional' && !repeat) return null;
		throw msg.language.get('RESOLVER_INVALID_ATTACHMENT', currentUsage.possibles[possible].name);
	}

	static minOrMax(value, min, max, currentUsage, possible, repeat, msg, suffix = '') {
		if (min && max) {
			if (value >= min && value <= max) return true;
			if (currentUsage.type === 'optional' && !repeat) return false;
			if (min === max) throw msg.language.get('RESOLVER_MINMAX_EXACTLY', currentUsage.possibles[possible].name, min, suffix);
			throw msg.language.get('RESOLVER_MINMAX_BOTH', currentUsage.possibles[possible].name, min, max, suffix);
		} else if (min) {
			if (value >= min) return true;
			if (currentUsage.type === 'optional' && !repeat) return false;
			throw msg.language.get('RESOLVER_MINMAX_MIN', currentUsage.possibles[possible].name, min, suffix);
		} else if (max) {
			if (value <= max) return true;
			if (currentUsage.type === 'optional' && !repeat) return false;
			throw msg.language.get('RESOLVER_MINMAX_MAX', currentUsage.possibles[possible].name, max, suffix);
		}
		return true;
	}

}

module.exports = ArgResolver;
