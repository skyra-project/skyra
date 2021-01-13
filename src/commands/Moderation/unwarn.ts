import { GuildSettings, ModerationEntity } from '#lib/database';
import { HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '#lib/structures/commands/ModerationCommand';
import { GuildMessage } from '#lib/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Moderation } from '#utils/constants';
import { floatPromise, getImage } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['uw', 'unwarning'],
	description: LanguageKeys.Commands.Moderation.UnwarnDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnwarnExtended,
	usage: '<case:number> [reason:...string]'
})
export default class extends ModerationCommand {
	public async run(message: GuildMessage, [caseID, reason]: [number, string]) {
		const [autoDelete, messageDisplay, reasonDisplay, t] = await message.guild.readSettings((settings) => [
			settings[GuildSettings.Messages.ModerationAutoDelete],
			settings[GuildSettings.Messages.ModerationMessageDisplay],
			settings[GuildSettings.Messages.ModerationReasonDisplay],
			settings.getLanguage()
		]);

		const modlog = await message.guild.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warning)) {
			throw t(LanguageKeys.Commands.Moderation.GuildWarnNotFound);
		}

		const user = await modlog.fetchUser();
		const unwarnLog = await this.handle(message, { target: user, reason, modlog, duration: null, preHandled: null });

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (autoDelete) {
			if (message.deletable) floatPromise(this, message.nuke());
		}

		if (messageDisplay) {
			const originalReason = reasonDisplay ? unwarnLog.reason : null;
			return message.send(
				t(
					originalReason ? LanguageKeys.Commands.Moderation.ModerationOutputWithReason : LanguageKeys.Commands.Moderation.ModerationOutput,

					{
						count: 1,
						range: unwarnLog.caseID,
						users: `\`${user.tag}\``,
						reason: originalReason
					}
				)
			);
		}

		return null;
	}

	public async handle(message: GuildMessage, context: HandledCommandContext<null> & { modlog: ModerationEntity }) {
		return message.guild.security.actions.unWarning(
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
}
