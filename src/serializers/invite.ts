import { Serializer, SerializerUpdateContext } from '#lib/database/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';

export default class UserSerializer extends Serializer<string> {
	private readonly kRegExp = /^(?:https?:\/\/)?(?:www.)?(?:discord\.gg\/|discordapp\.com\/invite\/)?(?<code>[\w\d-]{2,})$/i;

	public async parse(value: string, context: SerializerUpdateContext) {
		const parsed = this.kRegExp.exec(value);
		if (parsed === null) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidInvite, { name: context.entry.name }));
		}

		const { code } = parsed.groups!;
		const invite = await this.client.invites.fetch(code);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			return this.error(context.language.get(LanguageKeys.Resolvers.InvalidInvite, { name: context.entry.name }));
		}

		return this.ok(code);
	}

	public async isValid(value: string, context: SerializerUpdateContext): Promise<boolean> {
		const invite = await this.client.invites.fetch(value);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			throw context.language.get(LanguageKeys.Resolvers.InvalidInvite, { name: context.entry.name });
		}

		return true;
	}
}
