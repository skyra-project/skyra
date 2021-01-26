import { GuildSettings, ModerationEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HandledCommandContext, ModerationCommand } from '#lib/moderation';
import type { GuildMessage } from '#lib/types';
import { Moderation } from '#utils/constants';
import { floatPromise, getImage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ModerationCommand.Options>({
	aliases: ['uw', 'unwarning'],
	description: LanguageKeys.Commands.Moderation.UnwarnDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnwarnExtended
})
export class UserModerationCommand extends ModerationCommand {
	public async run(message: GuildMessage, args: ModerationCommand.Args) {
		const caseID = await args.pick('case');
		const reason = await args.rest('string');

		const [autoDelete, messageDisplay, reasonDisplay] = await message.guild.readSettings([
			GuildSettings.Messages.ModerationAutoDelete,
			GuildSettings.Messages.ModerationMessageDisplay,
			GuildSettings.Messages.ModerationReasonDisplay
		]);

		const modlog = await message.guild.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warning)) {
			throw args.t(LanguageKeys.Commands.Moderation.GuildWarnNotFound);
		}

		const user = await modlog.fetchUser();
		const unwarnLog = await this.handle(message, { args, target: user, reason, modlog, duration: null, preHandled: null });

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (autoDelete) {
			if (message.deletable) floatPromise(message.nuke());
		}

		if (messageDisplay) {
			const originalReason = reasonDisplay ? unwarnLog.reason : null;
			const content = args.t(
				originalReason ? LanguageKeys.Commands.Moderation.ModerationOutputWithReason : LanguageKeys.Commands.Moderation.ModerationOutput,
				{
					count: 1,
					range: unwarnLog.caseID,
					users: `\`${user.tag}\``,
					reason: originalReason
				}
			);
			return message.send(content) as Promise<GuildMessage>;
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
			await this.getTargetDM(message, context.args, context.target)
		);
	}
}
