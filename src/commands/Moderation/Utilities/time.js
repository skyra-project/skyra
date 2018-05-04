const { Command, Moderation: { schemaKeys, typeKeys }, ModerationLog, Duration, util: { parseModlog } } = require('../../../index');
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
		const modlog = await this.client.moderation.getCase(msg.guild.id, caseID);
		if (!modlog) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');
		if (!cancel && modlog[schemaKeys.TIMED]) throw msg.language.get('COMMAND_TIME_TIMED');

		const user = await this.client.users.fetch(modlog[schemaKeys.USER]);
		const type = await this.getActions(msg, modlog, user).catch(error => { throw msg.language.get(error); });
		const task = this.client.schedule.tasks.find(_task => _task.data && _task.data[schemaKeys.CASE] === modlog[schemaKeys.CASE]);

		if (cancel) return this.cancel(msg, modlog, task);
		if (task) {
			if (modlog[schemaKeys.APPEAL]) throw msg.language.get('MODLOG_APPEALED');
			throw msg.language.get('MODLOG_TIMED', task.timestamp - Date.now());
		}
		if (!time.length) throw msg.language.get('COMMAND_TIME_UNDEFINED_TIME');

		const { offset } = new Duration(time.join(' '));
		await this.client.schedule.create(type, offset + Date.now(), {
			catchUp: true,
			data: {
				[schemaKeys.USER]: user.id,
				[schemaKeys.GUILD]: msg.guild.id,
				[schemaKeys.DURATION]: offset,
				[schemaKeys.CASE]: caseID
			}
		});

		const newModLog = {
			...modlog,
			[schemaKeys.DURATION]: offset,
			[schemaKeys.MODERATOR]: msg.author.id,
			[schemaKeys.TIMED]: true
		};
		await this.client.moderation.updateCase(msg.guild, newModLog);
		await this.updateModlog(msg, newModLog);

		return msg.sendMessage(msg.language.get('COMMAND_TIME_SCHEDULED', ModerationLog.TYPES[type].title, user, offset));
	}

	async cancel(msg, modlog, task) {
		if (!task) throw msg.language.get('COMMAND_TIME_NOT_SCHEDULED');
		await task.delete();

		const newModLog = {
			...modlog,
			[schemaKeys.DURATION]: null,
			[schemaKeys.MODERATOR]: msg.author.id,
			[schemaKeys.TIMED]: false
		};
		await this.client.moderation.updateCase(msg.guild, newModLog);
		await this.updateModlog(msg, newModLog);

		return msg.sendMessage(msg.language.get('COMMAND_TIME_ABORTED', ModerationLog.TYPES[modlog[schemaKeys.TYPE]].title));
	}

	async updateModlog(msg, modcase) {
		const { modlog } = msg.guild.configs.channels;
		if (!modlog) return null;
		const channel = msg.guild.channels.get(modlog);
		if (!channel) {
			msg.guild.configs.reset('channels.modlog');
			return null;
		}

		// Fetch the message to edit it
		const messages = await channel.messages.fetch({ limit: 100 });
		const message = messages.find(mes => mes.author.id === this.client.user.id
			&& mes.embeds.length > 0
			&& mes.embeds[0].type === 'rich'
			&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${modcase[schemaKeys.CASE]}`
		);

		const parsedModLog = await parseModlog(this.client, msg.guild, modcase);

		if (message) return message.edit({ embed: parsedModLog.embed });
		return channel.send({ embed: parsedModLog.embed });
	}

	getActions(msg, modlog, user) {
		switch (modlog[schemaKeys.TYPE]) {
			case typeKeys.BAN: return this.checkBan(msg, modlog, user);
			case typeKeys.MUTE: return this.checkMute(msg, modlog);
			case typeKeys.VOICE_MUTE: return this.checkVMute(msg, modlog, user);
			default: throw 'COMMAND_TIME_UNSUPPORTED_TIPE';
		}
	}

	async checkBan(msg, modlog, user) {
		if (!msg.guild.me.permissions.has(FLAGS.BAN_MEMBERS)) throw 'COMMAND_UNBAN_MISSING_PERMISSION';
		const users = await msg.guild.fetchBans().catch(() => { throw 'SYSTEM_FETCHBANS_FAIL'; });
		if (!users.size) throw 'GUILD_BANS_EMPTY';
		const member = users.get(user.id);
		if (!member) throw 'GUILD_BANS_NOT_FOUND';
		return typeKeys.UN_BAN;
	}

	async checkMute(msg, modlog) {
		if (!msg.guild.me.permissions.has(FLAGS.MANAGE_ROLES)) throw 'COMMAND_UNMUTE_MISSING_PERMISSION';
		if (!msg.guild.configs.mutes.includes(modlog[schemaKeys.USER])) throw 'COMMAND_MUTE_USER_NOT_MUTED';
		return typeKeys.UN_MUTE;
	}

	async checkVMute(msg, modlog, user) {
		if (!msg.guild.me.permissions.has(FLAGS.MUTE_MEMBERS)) throw 'COMMAND_VMUTE_MISSING_PERMISSION';
		const member = await msg.guild.members.fetch(user).catch(() => { throw 'USER_NOT_IN_GUILD'; });
		if (!member.serverMute) throw 'COMMAND_VMUTE_USER_NOT_MUTED';
		return typeKeys.UN_VOICE_MUTE;
	}

};
