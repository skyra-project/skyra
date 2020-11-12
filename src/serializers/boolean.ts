import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Awaited } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['bool']
})
export default class UserSerializer extends Serializer<boolean> {
	// TODO(kyranet): Localize this.
	private readonly kTruthyTerms = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
	// TODO(kyranet): Localize this.
	private readonly kFalsyTerms = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);

	public parse(value: string, context: SerializerUpdateContext) {
		const boolean = value.toLowerCase();
		if (this.kTruthyTerms.has(boolean)) return this.ok(true);
		if (this.kFalsyTerms.has(boolean)) return this.ok(false);
		return this.error(context.language.get(LanguageKeys.Resolvers.InvalidBool, { name: context.entry.name }));
	}

	public isValid(value: boolean): Awaited<boolean> {
		return typeof value === 'boolean';
	}

	public stringify(value: boolean): string {
		// TODO(kyranet): Localize this.
		return value ? 'Enabled' : 'Disabled';
	}
}
