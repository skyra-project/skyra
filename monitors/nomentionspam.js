const { Monitor, ModLog } = require('../index');
const cooldown = new Map();

module.exports = class extends Monitor {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			ignoreBots: false
		});
	}

	async run(msg, settings, i18n) {
		if (!(settings.selfmod.nomentionspam === true
												&& msg.member
												&& msg.member.bannable
												&& !(msg.mentions.users.size === 1 && msg.mentions.users.first().bot))) return false;

		const filteredCollection = msg.mentions.users.filter(entry => entry.id !== msg.author.id);
		if (msg.mentions.everyone === false
												&& msg.mentions.roles.size === 0
												&& (filteredCollection.size === 0 || filteredCollection.first().bot)) return false;

		if (!cooldown.has(msg.guild.id)) cooldown.set(msg.guild.id, new NMS());
		const amount = filteredCollection.size + (msg.mentions.roles.size * 2) + (msg.mentions.everyone * 5);
		const newAmount = cooldown.get(msg.guild.id).add(msg.author.id, amount);
		if (newAmount >= (settings.selfmod.nmsthreshold || 20)) {
			msg.author.action = 'ban';
			await msg.guild.ban(msg.author.id, { days: 1, reason: i18n.get('CONST_MONITOR_NMS') }).catch(this.handleError);
			await msg.send(i18n.get('MONITOR_NMS_MESSAGE', msg.author)).catch(this.handleError);

			cooldown.get(msg.guild.id).delete(msg.author.id);

			return new ModLog(msg.guild)
				.setModerator(this.client.user)
				.setUser(msg.author)
				.setType('ban')
				.setReason(i18n.get('MONITOR_NMS_MODLOG', settings.selfmod.nmsthreshold, newAmount))
				.send()
				.catch(this.handleError);
		}

		return true;
	}

	handleError(err) {
		this.client.emit('log', err, 'error');
	}

};

class NMS {

	constructor() {
		this.cooldown = new Map();
	}

	get(user) {
		return this.cooldown.get(user)
												|| (this.cooldown.set(user, { id: user, amount: 0, timeout: null }) && { id: user, amount: 0, timeout: null });
	}

	add(user, amount) {
		const entry = this.get(user);
		entry.amount += amount;
		this.timeout(entry);
		this.cooldown.set(user, entry);
		return entry.amount;
	}

	timeout(entry) {
		clearTimeout(entry.timeout);
		entry.timeout = setTimeout(() => this.delete(entry.id), (entry.amount + 4) * 1000);
	}

	delete(user) {
		clearTimeout(this.get(user).timeout);
		this.cooldown.delete(user);
	}

}
