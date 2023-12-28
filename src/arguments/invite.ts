import { LanguageKeys } from '#lib/i18n/languageKeys';
import { DiscordInviteLinkRegex } from '@sapphire/discord-utilities';
import { Argument } from '@sapphire/framework';

export class UserArgument extends Argument<string> {
	public async run(parameter: string, context: Argument.Context) {
		const parsed = DiscordInviteLinkRegex.exec(parameter);
		if (parsed === null) {
			return this.error({ parameter, identifier: LanguageKeys.Arguments.Invite, context });
		}

		const { code } = parsed.groups!;
		const invite = await this.container.client.invites.fetch(code);
		if (invite === null || !Reflect.has(invite, 'guildId')) {
			return this.error({ parameter, identifier: LanguageKeys.Arguments.Invite, context });
		}

		return this.ok(code);
	}
}
