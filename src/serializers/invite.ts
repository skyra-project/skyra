import { Serializer } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const result = await args.pickResult('invite');
		return result.match({
			ok: (value) => this.ok(value.code),
			err: (error) => this.errorFromArgument(args, error)
		});
	}

	public async isValid(value: string, { t, entry }: Serializer.UpdateContext): Promise<boolean> {
		const invite = await this.container.client.invites.fetch(value);
		if (invite === null || !Reflect.has(invite, 'guildId')) {
			throw t(LanguageKeys.Serializers.InvalidInvite, { name: entry.name });
		}

		return true;
	}
}
