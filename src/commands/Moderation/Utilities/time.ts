import { Permissions, TextChannel } from 'discord.js';
import { CommandStore, Duration, KlasaMessage, KlasaUser, ScheduledTask } from 'klasa';
import { ModerationManagerEntry } from '../../../lib/structures/ModerationManagerEntry';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { ModerationSchemaKeys, ModerationTypeKeys } from '../../../lib/util/constants';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Sets a timer.',
			permissionLevel: 6,
			runIn: ['text'],
			usage: '[cancel] <Case:integer> [timer:...string]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [cancel, caseID, time]: ['cancel', number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog) throw message.language.get('COMMAND_REASON_NOT_EXISTS');
		if (!cancel && modlog.temporary) throw message.language.get('COMMAND_TIME_TIMED');

		const user = await this.client.users.fetch(typeof modlog.user === 'string' ? modlog.user : modlog.user!.id);
		const type = await this.getActions(message, modlog, user);
		const task = this.client.schedule.tasks.find(_task => _task.data && _task.data[ModerationSchemaKeys.Case] === modlog.case)!;

		if (cancel) return this.cancel(message, modlog, task);
		if (modlog.appealed) throw message.language.get('MODLOG_APPEALED');
		if (task) throw message.language.get('MODLOG_TIMED', task.data.timestamp - Date.now());
		if (!time.length) throw message.language.get('COMMAND_TIME_UNDEFINED_TIME');

		const { offset } = new Duration(time);
		await this.client.schedule.create(type, offset + Date.now(), {
			catchUp: true,
			data: {
				[ModerationSchemaKeys.User]: user.id,
				[ModerationSchemaKeys.Guild]: message.guild!.id,
				[ModerationSchemaKeys.Duration]: offset,
				[ModerationSchemaKeys.Case]: caseID
			}
		});

		await modlog.edit({
			[ModerationSchemaKeys.Duration]: offset,
			[ModerationSchemaKeys.Moderator]: message.author!.id
		});
		await this.updateModlog(message, modlog);

		return message.sendLocale('COMMAND_TIME_SCHEDULED', [modlog.name, user, offset]);
	}

	private async cancel(message: KlasaMessage, modcase: ModerationManagerEntry, task: ScheduledTask) {
		if (!task) throw message.language.get('COMMAND_TIME_NOT_SCHEDULED');
		await task.delete();

		await modcase.edit({
			[ModerationSchemaKeys.Duration]: null,
			[ModerationSchemaKeys.Moderator]: message.author!.id
		});
		await this.updateModlog(message, modcase);

		return message.sendLocale('COMMAND_TIME_ABORTED', [modcase.name]);
	}

	private async updateModlog(message: KlasaMessage, modcase: ModerationManagerEntry) {
		const modlog = message.guild!.settings.get(GuildSettings.Channels.ModerationLogs);
		if (!modlog) return null;
		const channel = message.guild!.channels.get(modlog) as TextChannel;
		if (!channel) {
			const { errors } = await message.guild!.settings.reset(GuildSettings.Channels.ModerationLogs);
			if (errors.length) throw String(errors[0]);
			return null;
		}

		// Fetch the message to edit it
		const messages = await channel.messages.fetch({ limit: 100 });
		const msg = messages.find(mes => mes.author!.id === this.client.user!.id
			&& mes.embeds.length > 0
			&& mes.embeds[0].type === 'rich'
			&& Boolean(mes.embeds[0].footer) && mes.embeds[0].footer!.text === `Case ${modcase.case}`);
		const embed = await modcase.prepareEmbed();
		return msg ? msg.edit(embed) : channel.send(embed);
	}

	private getActions(message: KlasaMessage, modlog: ModerationManagerEntry, user: KlasaUser) {
		switch (modlog.type) {
			case ModerationTypeKeys.TemporaryBan:
			case ModerationTypeKeys.Ban: return this.checkBan(message, user);
			case ModerationTypeKeys.TemporaryMute:
			case ModerationTypeKeys.Mute: return this.checkMute(message, user);
			case ModerationTypeKeys.TemporaryVoiceMute:
			case ModerationTypeKeys.VoiceMute: return this.checkVMute(message, user);
			default: throw message.language.get('COMMAND_TIME_UNSUPPORTED_TIPE');
		}
	}

	private async checkBan(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) throw message.language.get('COMMAND_UNBAN_MISSING_PERMISSION');
		const users = await message.guild!.fetchBans().catch(() => {
			throw message.language.get('SYSTEM_FETCHBANS_FAIL');
		});
		if (!users.size) throw message.language.get('GUILD_BANS_EMPTY');
		const member = users.get(user.id);
		if (!member) throw message.language.get('GUILD_BANS_NOT_FOUND');
		return 'unban';
	}

	private checkMute(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) throw message.language.get('COMMAND_UNMUTE_MISSING_PERMISSION');
		const stickyRoles = message.guild!.settings.get(GuildSettings.StickyRoles).find(stickyRole => stickyRole.user === user.id);
		if (!stickyRoles || !stickyRoles.roles.includes(message.guild!.settings.get(GuildSettings.Roles.Muted))) throw message.language.get('COMMAND_MUTE_USER_NOT_MUTED');
		return 'unmute';
	}

	private async checkVMute(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) throw message.language.get('COMMAND_VMUTE_MISSING_PERMISSION');
		const member = await message.guild!.members.fetch(user).catch(() => {
			throw message.language.get('USER_NOT_IN_GUILD');
		});
		if (!member.voice.serverMute) throw message.language.get('COMMAND_VMUTE_USER_NOT_MUTED');
		return 'unvmute';
	}

}
