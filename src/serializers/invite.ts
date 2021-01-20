import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';

export default class UserSerializer extends Serializer<string> {
	private readonly kRegExp = /^(?:https?:\/\/)?(?:www.)?(?:discord\.gg\/|discordapp\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i;

	public async parse(value: string, { t, entry }: SerializerUpdateContext) {
		const parsed = this.kRegExp.exec(value);
		if (parsed === null) {
			return this.error(t(LanguageKeys.Resolvers.InvalidInvite, { name: entry.name }));
		}

		const { code } = parsed.groups!;
		const invite = await this.context.client.invites.fetch(code);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			return this.error(t(LanguageKeys.Resolvers.InvalidInvite, { name: entry.name }));
		}

		return this.ok(code);
	}

	public async isValid(value: string, { t, entry }: SerializerUpdateContext): Promise<boolean> {
		const invite = await this.context.client.invites.fetch(value);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			throw t(LanguageKeys.Resolvers.InvalidInvite, { name: entry.name });
		}

		return true;
	}
}
