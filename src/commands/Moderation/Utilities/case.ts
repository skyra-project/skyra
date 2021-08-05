import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { getModeration } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';

@ApplyOptions<SkyraCommand.Options>({
	description: LanguageKeys.Commands.Moderation.CaseDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.CaseExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: ['EMBED_LINKS'],
	runIn: ['GUILD_ANY'],
	subCommands: ['delete', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const caseId = await args.pick('case');

		const moderation = getModeration(message.guild);
		const entry = await moderation.fetch(caseId);
		if (entry) {
			const embed = await entry.prepareEmbed();
			return send(message, { embeds: [embed] });
		}
		this.error(LanguageKeys.Commands.Moderation.ReasonNotExists);
	}

	public async delete(message: GuildMessage, args: SkyraCommand.Args) {
		const caseId = await args.pick('case');

		const moderation = getModeration(message.guild);
		const entry = await moderation.fetch(caseId);
		if (!entry) this.error(LanguageKeys.Commands.Moderation.ReasonNotExists);

		entry.remove();
		moderation.delete(entry.caseId);

		const content = args.t(LanguageKeys.Commands.Moderation.CaseDeleted, { case: entry.caseId });
		return send(message, content);
	}
}
