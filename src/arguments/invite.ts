import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Argument } from '@sapphire/framework';

export default class UserArgument extends Argument<string> {
	private readonly kRegExp = /^(?:https?:\/\/)?(?:www.)?(?:discord\.gg\/|discordapp\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i;

	public async run(parameter: string) {
		const parsed = this.kRegExp.exec(parameter);
		if (parsed === null) {
			return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidInvite });
		}

		const { code } = parsed.groups!;
		const invite = await this.context.client.invites.fetch(code);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			return this.error({ parameter, identifier: LanguageKeys.Resolvers.InvalidInvite });
		}

		return this.ok(code);
	}
}
