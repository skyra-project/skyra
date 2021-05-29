import { Serializer, SerializerUpdateContext } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { UserError } from '@sapphire/framework';
import type { Awaited } from '@sapphire/utilities';

export class UserSerializer extends Serializer<string> {
	public async parse(args: Serializer.Args) {
		return this.result(args, await args.pickResult('snowflake'));
	}

	public isValid(value: string, { entry }: SerializerUpdateContext): Awaited<boolean> {
		const guild = this.context.client.guilds.cache.get(value);
		if (!guild) {
			throw new UserError({ identifier: LanguageKeys.Serializers.InvalidGuild, context: { name: entry.name } });
		}

		return true;
	}

	public stringify(value: string) {
		return (this.context.client.guilds.cache.get(value) || { name: value }).name;
	}
}
