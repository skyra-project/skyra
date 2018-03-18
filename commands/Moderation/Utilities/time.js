const { Command, Moderation, ModerationLog, TimeParser } = require('../../../index');
const { Permissions: { FLAGS } } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			cooldown: 5,
			description: 'Sets a timer.',
			permLevel: 6,
			runIn: ['text'],
			usage: '[cancel] <Case:integer> [timer:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [cancel, caseID, ...time]) {
		const [modlog] = await this.client.moderation.getCases(msg.guild, {
			[Moderation.schemaKeys.CASE]: caseID
		});
		if (!modlog) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');
		if (modlog[Moderation.schemaKeys.TIMED]) throw msg.language.get('COMMAND_TIME_TIMED');

		const user = await this.client.users.fetch(modlog[Moderation.schemaKeys.USER]);
		const type = await this.getActions(msg, modlog, user).catch(error => { throw msg.language.get(error); });
		const task = this.client.schedule.tasks.find(_task => _task.data && _task.data[Moderation.schemaKeys.CASE] === modlog[Moderation.schemaKeys.CASE]);

		if (cancel) return this.cancel(msg, caseID, task);
		if (task) {
			if (modlog[Moderation.schemaKeys.APPEAL]) throw msg.language.get('MODLOG_APPEALED');
			throw msg.language.get('MODLOG_TIMED', task.timestamp - Date.now());
		}
		if (!time.length) throw msg.language.get('COMMAND_TIME_UNDEFINED_TIME');

		const { duration } = new TimeParser(time.join(' '));
		await this.client.schedule.create(type, duration + Date.now(), {
			catchUp: true,
			data: {
				[Moderation.schemaKeys.USER]: msg.author.id,
				[Moderation.schemaKeys.GUILD]: msg.guild.id,
				[Moderation.schemaKeys.DURATION]: duration,
				[Moderation.schemaKeys.CASE]: caseID
			}
		});

		await this.client.moderation.updateCase(msg.guild, {
			[Moderation.schemaKeys.CASE]: caseID,
			[Moderation.schemaKeys.TIMED]: false
		});

		return msg.sendMessage(msg.language.get('COMMAND_TIME_SCHEDULED', ModerationLog.TYPES[type].title, user, duration));
	}

	async cancel(msg, caseID, task) {
		if (!task) throw msg.language.get('COMMAND_TIME_NOT_SCHEDULED');
		await task.delete();
		await this.client.moderation.updateCase(msg.guild, {
			[Moderation.schemaKeys.CASE]: caseID,
			[Moderation.schemaKeys.TIMED]: false
		});
		return msg.sendMessage(msg.language.get('COMMAND_TIME_ABORTED', ModerationLog.getColor(task.type).title));
	}

	getActions(msg, modlog, user) {
		switch (modlog[Moderation.schemaKeys.TYPE]) {
			case Moderation.typeKeys.BAN: return this.checkBan(msg, modlog, user);
			case Moderation.typeKeys.MUTE: return this.checkMute(msg, modlog);
			case Moderation.typeKeys.VOICE_MUTE: return this.checkVMute(msg, modlog, user);
			default: throw 'COMMAND_TIME_UNSUPPORTED_TIPE';
		}
	}

	async checkBan(msg, modlog, user) {
		if (!msg.guild.me.permissions.has(FLAGS.BAN_MEMBERS)) throw 'COMMAND_UNBAN_MISSING_PERMISSION';
		const users = await msg.guild.fetchBans().catch(() => { throw 'SYSTEM_FETCHBANS_FAIL'; });
		if (!users.size) throw 'GUILD_BANS_EMPTY';
		const member = users.get(user.id);
		if (!member) throw 'GUILD_BANS_NOT_FOUND';
		return Moderation.typeKeys.UN_BAN;
	}

	async checkMute(msg, modlog) {
		if (!msg.guild.me.permissions.has(FLAGS.MANAGE_ROLES)) throw 'COMMAND_UNMUTE_MISSING_PERMISSION';
		if (!msg.guild.settings.mutes.includes(modlog.user)) throw 'COMMAND_MUTE_USER_NOT_MUTED';
		return Moderation.typeKeys.UN_MUTE;
	}

	async checkVMute(msg, dmodlogoc, user) {
		if (!msg.guild.me.permissions.has(FLAGS.MUTE_MEMBERS)) throw 'COMMAND_VMUTE_MISSING_PERMISSION';
		const member = await msg.guild.members.fetch(user).catch(() => { throw 'USER_NOT_IN_GUILD'; });
		if (!member.serverMute) throw 'COMMAND_VMUTE_USER_NOT_MUTED';
		return Moderation.typeKeys.UN_VOICE_MUTE;
	}

};
