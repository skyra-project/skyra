import { HandledCommandContext, ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { ModerationManagerEntry } from '@lib/structures/ModerationManagerEntry';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { ApplyOptions } from '@skyra/decorators';
import { Moderation } from '@utils/constants';
import { floatPromise, getImage } from '@utils/util';
import { KlasaMessage } from 'klasa';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['uw', 'unwarning'],
	description: language => language.tget('COMMAND_UNWARN_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_UNWARN_EXTENDED'),
	usage: '<case:number> [reason:...string]'
})
export default class extends ModerationCommand {

	public async prehandle() { /* Do nothing */ }

	public async run(message: KlasaMessage, [caseID, reason]: [number, string]) {
		const modlog = await message.guild!.moderation.fetch(caseID);
		if (!modlog || !modlog.isType(Moderation.TypeCodes.Warn)) throw message.language.tget('GUILD_WARN_NOT_FOUND');

		const user = typeof modlog.user === 'string' ? await this.client.users.fetch(modlog.user) : modlog.user;
		const unwarnLog = await this.handle(message, { target: user, reason, modlog, duration: null, preHandled: null });

		// If the server was configured to automatically delete messages, delete the command and return null.
		if (message.guild!.settings.get(GuildSettings.Messages.ModerationAutoDelete)) {
			if (message.deletable) floatPromise(this, message.nuke());
		}

		if (message.guild!.settings.get(GuildSettings.Messages.ModerationMessageDisplay)) {
			const originalReason = message.guild!.settings.get(GuildSettings.Messages.ModerationReasonDisplay) ? unwarnLog.reason : null;
			return message.sendLocale('COMMAND_MODERATION_OUTPUT', [[unwarnLog.case], unwarnLog.case, [`\`${user.tag}\``], originalReason]);
		}

		return null;
	}

	public handle(message: KlasaMessage, context: HandledCommandContext<null> & { modlog: ModerationManagerEntry }) {
		return message.guild!.security.actions.unWarning({
			user_id: context.target.id,
			moderator_id: message.author.id,
			reason: context.reason,
			image_url: getImage(message)
		}, context.modlog.case!, this.getTargetDM(message, context.target));
	}

	public async posthandle() { /* Do nothing */ }

}
