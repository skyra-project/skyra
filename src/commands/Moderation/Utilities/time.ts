import { Permissions, TextChannel } from 'discord.js';
import { CommandStore, Duration, KlasaMessage, KlasaUser, ScheduledTask } from 'klasa';
import { ModerationManagerEntry } from '../../../lib/structures/ModerationManagerEntry';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { Moderation } from '../../../lib/util/constants';
import { PermissionLevels } from '../../../lib/types/Enums';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Sets a timer.',
			permissionLevel: PermissionLevels.Moderator,
			runIn: ['text'],
			usage: '[cancel] <Case:integer> [timer:...string]',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [cancel, caseID, time]: ['cancel', number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog) throw message.language.tget('COMMAND_REASON_NOT_EXISTS');
		if (!cancel && modlog.temporaryType) throw message.language.tget('COMMAND_TIME_TIMED');

		const user = await this.client.users.fetch(typeof modlog.user === 'string' ? modlog.user : modlog.user.id);
		const type = await this.getActions(message, modlog, user);
		const task = this.client.schedule.tasks.find(_task => _task.data && _task.data[Moderation.SchemaKeys.Case] === modlog.case)!;

		if (cancel) return this.cancel(message, modlog, task);
		if (modlog.appealType) throw message.language.tget('MODERATION_LOG_APPEALED');
		if (task) throw message.language.tget('MODLOG_TIMED', task.data.timestamp - Date.now());
		if (!time.length) throw message.language.tget('COMMAND_TIME_UNDEFINED_TIME');

		const { offset } = new Duration(time);
		await this.client.schedule.create(type, offset + Date.now(), {
			catchUp: true,
			data: {
				[Moderation.SchemaKeys.User]: user.id,
				[Moderation.SchemaKeys.Guild]: message.guild!.id,
				[Moderation.SchemaKeys.Duration]: offset,
				[Moderation.SchemaKeys.Case]: caseID
			}
		});

		await modlog.edit({
			duration: offset,
			moderator_id: message.author.id
		});
		await this.updateModerationLog(message, modlog);

		return message.sendLocale('COMMAND_TIME_SCHEDULED', [modlog.title, user, offset]);
	}

	private async cancel(message: KlasaMessage, modcase: ModerationManagerEntry, task: ScheduledTask) {
		if (!task) throw message.language.tget('COMMAND_TIME_NOT_SCHEDULED');
		await task.delete();

		await modcase.edit({
			duration: null,
			moderator_id: message.author.id
		});
		await this.updateModerationLog(message, modcase);

		return message.sendLocale('COMMAND_TIME_ABORTED', [modcase.title]);
	}

	private async updateModerationLog(message: KlasaMessage, moderationManagerEntry: ModerationManagerEntry) {
		const moderationLog = message.guild!.settings.get(GuildSettings.Channels.ModerationLogs);
		if (!moderationLog) return null;
		const channel = message.guild!.channels.get(moderationLog) as TextChannel;
		if (!channel) {
			await message.guild!.settings.reset(GuildSettings.Channels.ModerationLogs);
			return null;
		}

		// Fetch the message to edit it
		const messages = await channel.messages.fetch({ limit: 100 });
		const msg = messages.find(mes => mes.author.id === this.client.user!.id
			&& mes.embeds.length > 0
			&& mes.embeds[0].type === 'rich'
			&& Boolean(mes.embeds[0].footer) && mes.embeds[0].footer!.text === `Case ${moderationManagerEntry.case}`);
		const embed = await moderationManagerEntry.prepareEmbed();
		return msg ? msg.edit(embed) : channel.send(embed);
	}

	private getActions(message: KlasaMessage, modlog: ModerationManagerEntry, user: KlasaUser) {
		switch (modlog.type) {
			case Moderation.TypeCodes.FastTemporaryBan:
			case Moderation.TypeCodes.TemporaryBan:
			case Moderation.TypeCodes.Ban: return this.checkBan(message, user);
			case Moderation.TypeCodes.FastTemporaryMute:
			case Moderation.TypeCodes.TemporaryMute:
			case Moderation.TypeCodes.Mute: return this.checkMute(message, user);
			case Moderation.TypeCodes.FastTemporaryVoiceMute:
			case Moderation.TypeCodes.TemporaryVoiceMute:
			case Moderation.TypeCodes.VoiceMute: return this.checkVMute(message, user);
			// TODO: Add the rest of restrictions
			default: throw message.language.tget('COMMAND_TIME_UNSUPPORTED_TIPE');
		}
	}

	private async checkBan(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) throw message.language.tget('COMMAND_UNBAN_MISSING_PERMISSION');
		const users = await message.guild!.fetchBans().catch(() => {
			throw message.language.tget('SYSTEM_FETCHBANS_FAIL');
		});
		if (!users.size) throw message.language.tget('GUILD_BANS_EMPTY');
		const member = users.get(user.id);
		if (!member) throw message.language.tget('GUILD_BANS_NOT_FOUND');
		return 'unban';
	}

	private checkMute(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) throw message.language.tget('COMMAND_UNMUTE_MISSING_PERMISSION');
		const stickyRoles = message.guild!.settings.get(GuildSettings.StickyRoles).find(stickyRole => stickyRole.user === user.id);
		if (!stickyRoles || !stickyRoles.roles.includes(message.guild!.settings.get(GuildSettings.Roles.Muted))) throw message.language.tget('COMMAND_MUTE_USER_NOT_MUTED');
		return 'unmute';
	}

	private async checkVMute(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) throw message.language.tget('COMMAND_VMUTE_MISSING_PERMISSION');
		const member = await message.guild!.members.fetch(user).catch(() => {
			throw message.language.tget('USER_NOT_IN_GUILD');
		});
		if (!member.voice.serverMute) throw message.language.tget('COMMAND_VMUTE_USER_NOT_MUTED');
		return 'unvmute';
	}

}
