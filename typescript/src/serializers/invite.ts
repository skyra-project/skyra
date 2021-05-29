import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		const invite = await args.pickResult('invite');
		return invite.success ? this.ok(invite.value.code) : this.errorFromArgument(args, invite.error);
	}

	public async isValid(value: string, { entry }: SerializerUpdateContext): Promise<boolean> {
		const invite = await this.context.client.invites.fetch(value);
		if (invite === null || !Reflect.has(invite, 'guildID')) {
			throw new UserError({ identifier: LanguageKeys.Serializers.InvalidInvite, context: { name: entry.name } });
		}

		return true;
	}
}
