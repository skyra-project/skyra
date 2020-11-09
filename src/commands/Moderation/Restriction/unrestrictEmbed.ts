import { GuildSettings } from '@lib/database';
import { ModerationCommand, ModerationCommandOptions } from '@lib/structures/ModerationCommand';
import { GuildMessage } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['un-restricted-embed', 'ure'],
	description: (language) => language.get(LanguageKeys.Commands.Moderation.UnrestrictEmbedDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Moderation.UnrestrictEmbedExtended),
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	private readonly kPath = GuildSettings.Roles.RestrictedEmbed;

	public async inhibit(message: GuildMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const [id, prefix, language] = await message.guild.readSettings((settings) => [
			settings[this.kPath],
			settings[GuildSettings.Prefix],
			settings.getLanguage()
		]);

		if (id && message.guild.roles.cache.has(id)) return false;
		throw language.get(LanguageKeys.Commands.Moderation.GuildSettingsRolesRestricted, {
			prefix,
			path: this.kPath
		});
	}

	public async prehandle() {
		/* Do nothing */
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.unRestrictEmbed(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.target)
		);
	}

	public async posthandle() {
		/* Do nothing */
	}
}
