import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { PermissionLevels } from '@lib/types/Enums';
import { ModerationEntity } from '@orm/entities/ModerationEntity';
import { Moderation } from '@utils/constants';
import { Permissions } from 'discord.js';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: 'Sets a timer.',
			permissionLevel: PermissionLevels.Moderator,
			runIn: ['text'],
			usage: '[cancel] <case:integer> (timer:timer)',
			usageDelim: ' '
		});

		this.createCustomResolver('timer', async (arg, possible, message, [cancel]) => {
			if (cancel === 'cancel') return null;
			if (!arg) throw message.language.tget('COMMAND_TIME_UNDEFINED_TIME');

			const restString = await this.client.arguments.get('...string')!.run(arg, possible, message) as string;
			return this.client.arguments.get('timespan')!.run(restString, possible, message);
		});
	}

	public async run(message: KlasaMessage, [cancel, caseID, duration]: ['cancel', number | 'latest', number | null]) {
		if (caseID === 'latest') caseID = await message.guild!.moderation.count();

		const entry = await message.guild!.moderation.fetch(caseID);
		if (!entry) throw message.language.tget('MODERATION_CASE_NOT_EXISTS');
		if (!cancel && entry.temporaryType) throw message.language.tget('COMMAND_TIME_TIMED');

		const user = await entry.fetchUser();
		await this.validateAction(message, entry, user);
		const task = this.client.schedules.queue.find(tk => tk.data
			&& tk.data[Moderation.SchemaKeys.Case] === entry.caseID
			&& tk.data[Moderation.SchemaKeys.Guild] === entry.guild.id)!;

		if (cancel) {
			if (!task) throw message.language.tget('COMMAND_TIME_NOT_SCHEDULED');

			await message.guild!.moderation.fetchChannelMessages();
			await entry.edit({
				duration: null,
				moderatorID: message.author.id
			});

			return message.sendLocale('COMMAND_TIME_ABORTED', [entry.title]);
		}

		if (entry.appealType || entry.invalidated) throw message.language.tget('MODERATION_LOG_APPEALED');
		if (task) throw message.language.tget('MODLOG_TIMED', (task.data.timestamp as number) - Date.now());

		await message.guild!.moderation.fetchChannelMessages();
		await entry.edit({
			duration,
			moderatorID: message.author.id
		});
		return message.sendLocale('COMMAND_TIME_SCHEDULED', [entry.title, user, duration]);
	}

	private validateAction(message: KlasaMessage, modlog: ModerationEntity, user: KlasaUser) {
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
			// TODO(kyranet): Add the rest of restrictions
			default: throw message.language.tget('COMMAND_TIME_UNSUPPORTED_TIPE');
		}
	}

	private async checkBan(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) throw message.language.tget('COMMAND_UNBAN_MISSING_PERMISSION');
		if (!await message.guild!.security.actions.userIsBanned(user)) throw message.language.tget('GUILD_BANS_NOT_FOUND');
	}

	private checkMute(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) throw message.language.tget('COMMAND_UNMUTE_MISSING_PERMISSION');
		if (!message.guild!.security.actions.userIsMuted(user)) throw message.language.tget('COMMAND_MUTE_USER_NOT_MUTED');
	}

	private async checkVMute(message: KlasaMessage, user: KlasaUser) {
		if (!message.guild!.me!.permissions.has(Permissions.FLAGS.MUTE_MEMBERS)) throw message.language.tget('COMMAND_VMUTE_MISSING_PERMISSION');
		if (!await message.guild!.security.actions.userIsVoiceMuted(user)) throw message.language.tget('COMMAND_VMUTE_USER_NOT_MUTED');
	}

}
