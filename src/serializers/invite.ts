import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const invite = await args.pickResult('invite');
		return invite.success ? this.ok(invite.value.code) : invite;
	}

	public async isValid(value: string, { t, entry }: SerializerUpdateContext): Promise<boolean> {
		const invite = await this.context.client.invites.fetch(value);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			throw t(LanguageKeys.Serializers.InvalidInvite, { name: entry.name });
		}

		return true;
	}
}
