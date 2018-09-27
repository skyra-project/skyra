const { Monitor, constants: { MODERATION: { TYPE_KEYS } } } = require('../index');

export default class extends Monitor {

	public constructor(client: Skyra, store: MonitorStore, file: string[], directory: string) {
		super(client, store, file, directory, { ignoreBots: false });
	}

	public async run(msg) {
		if (!msg.guild
			|| !msg.guild.settings.selfmod.nomentionspam
			|| !msg.member
			|| !msg.member.bannable
			|| (msg.mentions.users.size === 1 && msg.mentions.users.first().bot)
			|| await msg.hasAtLeastPermissionLevel(5)) return false;

		const count = (msg.member.everyone ? 5 : 0) + (msg.mentions.roles.size * 2) + (msg.mentions.users.size
			? this.filterUsers(msg.author.id, msg.mentions.users).size : 0);
		if (!count) return false;

		const amount = msg.guild.security.nms.add(msg.author.id, count);
		if (amount >= msg.guild.settings.selfmod.nmsthreshold) {
			await msg.guild.members.ban(msg.author.id, { days: 0, reason: msg.language.get('CONST_MONITOR_NMS') }).catch((error) => this.client.emit('apiError', error));
			await msg.sendLocale('MONITOR_NMS_MESSAGE', [msg.author]).catch((error) => this.client.emit('apiError', error));
			msg.guild.security.nms.delete(msg.author.id);

			return msg.guild.moderation.new
				.setModerator(this.client.user)
				.setUser(msg.author)
				.setType(TYPE_KEYS.BAN)
				.setReason(msg.language.get('MONITOR_NMS_MODLOG', msg.guild.settings.selfmod.nmsthreshold, amount))
				.create();
		}

		return true;
	}

	public filterUsers(userID, collection) {
		if (!collection.has(userID)) return collection;
		const clone = collection.clone();
		clone.delete(userID);
		return clone;
	}

}
