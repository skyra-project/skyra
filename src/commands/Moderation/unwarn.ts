import { HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ModerationEntity } from '@orm/entities/ModerationEntity';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { floatPromise, getImage } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['uw', 'unwarning'],
	description: (language) => language.tget('COMMAND_UNWARN_DESCRIPTION'),
	extendedHelp: (language) => language.tget('COMMAND_UNWARN_EXTENDED'),
	usage: '<case:number> [reason:...string]'
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async run(message: KlasaMessage, [caseID, reason]: [number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warning)) throw message.language.tget('GUILD_WARN_NOT_FOUND');

		const user = await modlog.fetchUser();
		const unwarnLog = await this.handle(message, { target: user, reason, modlog, duration: null, preHandled: null });

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (message.guild!.settings.get(GuildSettings.Messages.ModerationAutoDelete)) {
			if (message.deletable) floatPromise(this, message.nuke());
		}

		if (message.guild!.settings.get(GuildSettings.Messages.ModerationMessageDisplay)) {
			const originalReason = message.guild!.settings.get(GuildSettings.Messages.ModerationReasonDisplay) ? unwarnLog.reason : null;
			return message.sendLocale('COMMAND_MODERATION_OUTPUT', [[unwarnLog.caseID], unwarnLog.caseID, [`\`${user.tag}\``], originalReason]);
		}

		return null;
	}

	public async handle(message: KlasaMessage, context: HandledCommandContext<null> & { modlog: ModerationEntity }) {
		return message.guild!.security.actions.unWarning(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			context.modlog.caseID,
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}
}
