import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraSubcommand } from '#lib/structures';
import { PermissionLevels, type GuildMessage } from '#lib/types';
import { getModeration } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord.js';

@ApplyOptions<SkyraSubcommand.Options>({
	description: LanguageKeys.Commands.Moderation.CaseDescription,
	detailedDescription: LanguageKeys.Commands.Moderation.CaseExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subcommands: [
		{ name: 'delete', messageRun: 'delete' },
		{ name: 'show', messageRun: 'show', default: true }
	]
})
export class UserCommand extends SkyraSubcommand {
	public async show(message: GuildMessage, args: SkyraSubcommand.Args) {
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

		await entry.remove();
		moderation.delete(entry.caseId);

		const content = args.t(LanguageKeys.Commands.Moderation.CaseDeleted, { case: entry.caseId });
		return send(message, content);
	}
}
