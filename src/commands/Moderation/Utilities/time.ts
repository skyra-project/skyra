import { Command, Duration, constants : { MODERATION: { SCHEMA_KEYS, TYPE_KEYS } }; } from; '../../../index';
import { Permissions : { FLAGS }; } from; 'discord.js';

export default class extends Command {

	public constructor(client: Client, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			cooldown: 5,
			description: 'Sets a timer.',
			permissionLevel: 6,
			runIn: ['text'],
			usage: '[cancel] <Case:integer> [timer:...string]',
			usageDelim: ' '
		});
	}

	public async run(msg, [cancel, caseID, time]) {
		const modlog = await msg.guild.moderation.fetch(caseID);
		if (!modlog) throw msg.language.get('COMMAND_REASON_NOT_EXISTS');
		if (!cancel && modlog.temporary) throw msg.language.get('COMMAND_TIME_TIMED');

		const user = await this.client.users.fetch(modlog.user);
		const type = await this.getActions(msg, modlog, user);
		const task = this.client.schedule.tasks.find((_task) => _task.data && _task.data[SCHEMA_KEYS.CASE] === modlog.case);

		if (cancel) return this.cancel(msg, modlog, task);
		if (modlog.appealed) throw msg.language.get('MODLOG_APPEALED');
		if (task) throw msg.language.get('MODLOG_TIMED', task.data.timestamp - Date.now());
		if (!time.length) throw msg.language.get('COMMAND_TIME_UNDEFINED_TIME');

		const { offset } = new Duration(time);
		await this.client.schedule.create(type, offset + Date.now(), {
			catchUp: true,
			data: {
				[SCHEMA_KEYS.USER]: user.id,
				[SCHEMA_KEYS.GUILD]: msg.guild.id,
				[SCHEMA_KEYS.DURATION]: offset,
				[SCHEMA_KEYS.CASE]: caseID
			}
		});

		await modlog.edit({
			[SCHEMA_KEYS.DURATION]: offset,
			[SCHEMA_KEYS.MODERATOR]: msg.author.id
		});
		await this.updateModlog(msg, modlog);

		return msg.sendLocale('COMMAND_TIME_SCHEDULED', [modlog.name, user, offset]);
	}

	public async cancel(msg, modlog, task) {
		if (!task) throw msg.language.get('COMMAND_TIME_NOT_SCHEDULED');
		await task.delete();

		await modlog.edit({
			[SCHEMA_KEYS.DURATION]: null,
			[SCHEMA_KEYS.MODERATOR]: msg.author.id
		});
		await this.updateModlog(msg, modlog);

		return msg.sendLocale('COMMAND_TIME_ABORTED', [modlog.name]);
	}

	public async updateModlog(msg, modcase) {
		const { modlog } = msg.guild.settings.channels;
		if (!modlog) return null;
		const channel = msg.guild.channels.get(modlog);
		if (!channel) {
			msg.guild.settings.reset('channels.modlog');
			return null;
		}

		// Fetch the message to edit it
		const messages = await channel.messages.fetch({ limit: 100 });
		const message = messages.find((mes) => mes.author.id === this.client.user.id
			&& mes.embeds.length > 0
			&& mes.embeds[0].type === 'rich'
			&& mes.embeds[0].footer && mes.embeds[0].footer.text === `Case ${modcase.case}`
		);
		const embed = await modcase.prepareEmbed();
		return message ? message.edit(embed) : channel.send(embed);
	}

	public getActions(msg, modlog, user) {
		switch (modlog.type) {
			case TYPE_KEYS.TEMPORARY_BAN:
			case TYPE_KEYS.BAN: return this.checkBan(msg, modlog, user);
			case TYPE_KEYS.TEMPORARY_MUTE:
			case TYPE_KEYS.MUTE: return this.checkMute(msg, modlog, user);
			case TYPE_KEYS.TEMPORARY_VOICE_MUTE:
			case TYPE_KEYS.VOICE_MUTE: return this.checkVMute(msg, modlog, user);
			default: throw msg.language.get('COMMAND_TIME_UNSUPPORTED_TIPE');
		}
	}

	public async checkBan(msg, modlog, user) {
		if (!msg.guild.me.permissions.has(FLAGS.BAN_MEMBERS)) throw msg.language.get('COMMAND_UNBAN_MISSING_PERMISSION');
		const users = await msg.guild.fetchBans().catch(() => { throw msg.language.get('SYSTEM_FETCHBANS_FAIL'); });
		if (!users.size) throw msg.language.get('GUILD_BANS_EMPTY');
		const member = users.get(user.id);
		if (!member) throw msg.language.get('GUILD_BANS_NOT_FOUND');
		return 'unban';
	}

	public async checkMute(msg, modlog, user) {
		if (!msg.guild.me.permissions.has(FLAGS.MANAGE_ROLES)) throw msg.language.get('COMMAND_UNMUTE_MISSING_PERMISSION');

		const stickyRoles = msg.guild.settings.stickyRoles.find((stickyRole) => stickyRole.id === user.id);
		if (!stickyRoles || !stickyRoles.roles.includes(msg.guild.settings.roles.muted)) throw msg.language.get('COMMAND_MUTE_USER_NOT_MUTED');
		return 'unmute';
	}

	public async checkVMute(msg, modlog, user) {
		if (!msg.guild.me.permissions.has(FLAGS.MUTE_MEMBERS)) throw msg.language.get('COMMAND_VMUTE_MISSING_PERMISSION');
		const member = await msg.guild.members.fetch(user).catch(() => { throw msg.language.get('USER_NOT_IN_GUILD'); });
		if (!member.serverMute) throw msg.language.get('COMMAND_VMUTE_USER_NOT_MUTED');
		return 'unvmute';
	}

}
