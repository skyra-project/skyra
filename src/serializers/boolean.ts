import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Serializer, SerializerUpdateContext } from '@lib/database';
import { AliasPieceOptions } from 'klasa';

@ApplyOptions<AliasPieceOptions>({
	aliases: ['bool']
})
export default class extends Serializer {
	private kTruths = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
	private kFalses = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		const boolean = String(data).toLowerCase();
		if (this.kTruths.has(boolean)) return true;
		if (this.kFalses.has(boolean)) return false;
		throw language.get(LanguageKeys.Resolvers.InvalidBool, { name: entry.name });
	}

	public stringify(data: string) {
		return data ? 'Enabled' : 'Disabled';
	}
}
