import { ModerationEntity } from '@lib/database/entities/ModerationEntity';
import { HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { floatPromise, getImage } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['uw', 'unwarning'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.UnwarnDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.UnwarnExtended),
	usage: '<case:number> [reason:...string]'
})
export default class extends ModerationCommand {
	public async prehandle() {
		/* Do nothing */
	}

	public async run(message: KlasaMessage, [caseID, reason]: [number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warning)) throw message.language.get(LanguageKeys.Commands.Moderation.GuildWarnNotFound);

		const user = await modlog.fetchUser();
		const unwarnLog = await this.handle(message, { target: user, reason, modlog, duration: null, preHandled: null });

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (message.guild!.settings.get(GuildSettings.Messages.ModerationAutoDelete)) {
			if (message.deletable) floatPromise(this, message.nuke());
		}

		if (message.guild!.settings.get(GuildSettings.Messages.ModerationMessageDisplay)) {
			const originalReason = message.guild!.settings.get(GuildSettings.Messages.ModerationReasonDisplay) ? unwarnLog.reason : null;
			return message.sendLocale(
				originalReason ? LanguageKeys.Commands.Moderation.ModerationOutputWithReason : LanguageKeys.Commands.Moderation.ModerationOutput,
				[
					{
						count: 1,
						range: unwarnLog.caseID,
						users: `\`${user.tag}\``,
						reason: originalReason
					}
				]
			);
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
