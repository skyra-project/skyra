import { User, GuildMember } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { ModerationCommand } from '../../lib/structures/ModerationCommand';
import { ModerationManagerEntry } from '../../lib/structures/ModerationManagerEntry';
import { ModerationTypeKeys } from '../../lib/util/constants';

export default class extends ModerationCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: language => language.tget('COMMAND_UNWARN_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_UNWARN_EXTENDED'),
			modType: ModerationTypeKeys.UnWarn,
			permissionLevel: 5,
			requiredMember: true,
			usage: '<case:number> [reason:...string]'
		});
	}

	public async prehandle() { /* Do nothing */ }

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2416
	public async run(message: KlasaMessage, [caseID, reason]: [number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog || modlog.type !== ModerationTypeKeys.Warn) throw message.language.tget('GUILD_WARN_NOT_FOUND');

		const user = typeof modlog.user === 'string' ? await this.client.users.fetch(modlog.user) : modlog.user!;
		const unwarnLog = await this.handle(message, user, null, reason, modlog);

		return message.sendLocale('COMMAND_MODERATION_OUTPUT', [[unwarnLog.case], unwarnLog.case, [`\`${user.tag}\``], unwarnLog.reason]);
	}

	public async handle(message: KlasaMessage, user: User, _: GuildMember | null, reason: string | null, modlog: ModerationManagerEntry) {
		// Appeal the modlog and send a log to the moderation log channel
		await modlog.appeal();
		return this.sendModlog(message, user, reason);
	}

	public async posthandle() { /* Do nothing */ }

}
