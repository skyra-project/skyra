import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/commands/ModerationCommand';
import { GuildMessage } from '#lib/types';
import { getImage } from '#utils/util';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['um'],
	description: LanguageKeys.Commands.Moderation.UnmuteDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnmuteExtended,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	private readonly kPath = GuildSettings.Roles.Muted;

	public async inhibit(message: GuildMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const id = await message.guild.readSettings(this.kPath);
		if (id && message.guild.roles.cache.has(id)) return false;
		throw await message.resolveKey(LanguageKeys.Commands.Moderation.GuildSettingsRolesRestricted, {
			prefix: await message.guild.readSettings(GuildSettings.Prefix),
			path: this.kPath
		});
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.unMute(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason,
				imageURL: getImage(message)
			},
			await this.getTargetDM(message, context.target)
		);
	}
}
