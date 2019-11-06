import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationManagerEntry } from '../../lib/structures/ModerationManagerEntry';
import { Moderation } from '../../lib/util/constants';
import { GuildSettings } from '../../lib/types/settings/GuildSettings';
import { floatPromise } from '../../lib/util/util';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['uw', 'unwarning'],
			description: language => language.tget('COMMAND_UNWARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNWARN_EXTENDED'),
			usage: '<case:number> [reason:...string]'
		});
	}

	public async prehandle() { /* Do nothing */ }

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2416
	public async run(message: KlasaMessage, [caseID, reason]: [number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warn)) throw message.language.tget('GUILD_WARN_NOT_FOUND');

		const user = typeof modlog.user === 'string' ? await this.client.users.fetch(modlog.user) : modlog.user;
		const unwarnLog = await this.handle(message, user, reason, null, modlog);

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (message.guild!.settings.get(GuildSettings.Messages.ModerationAutoDelete)) {
			if (message.deletable) floatPromise(this, message.nuke());
			return null;
		}

		const originalReason = message.guild!.settings.get(GuildSettings.Messages.ModerationReasonDisplay) ? unwarnLog.reason : null;
		return message.sendLocale('COMMAND_MODERATION_OUTPUT', [[unwarnLog.case], unwarnLog.case, [`\`${user.tag}\``], originalReason]);
	}

	public async handle(message: KlasaMessage, target: User, reason: string | null, _duration: number | null, modlog: ModerationManagerEntry) {
		return message.guild!.security.actions.unWarning({
			user_id: target.id,
			moderator_id: message.author.id,
			reason
		}, modlog.case!, this.getTargetDM(message, target));
	}

	public async posthandle() { /* Do nothing */ }

}
