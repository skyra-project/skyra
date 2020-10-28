import { Serializer, SerializerUpdateContext } from '@lib/database';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['bool']
})
export default class extends Serializer<boolean> {
	private readonly kTruths = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
	private readonly kFalses = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);

	public parse(value: string, context: SerializerUpdateContext): boolean | Promise<boolean> {
		const boolean = value.toLowerCase();
		if (this.kTruths.has(boolean)) return true;
		if (this.kFalses.has(boolean)) return false;
		throw context.language.get(LanguageKeys.Resolvers.InvalidBool, { name: context.entry.name });
	}

	public isValid(value: boolean): boolean {
		return typeof value === 'boolean';
	}

	public stringify(data: boolean) {
		return data ? 'Enabled' : 'Disabled';
	}
}
