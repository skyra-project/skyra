import { ApplyOptions } from '@skyra/decorators';
import { Serializer, SerializerOptions, SerializerUpdateContext } from 'klasa';

@ApplyOptions<SerializerOptions>({
	aliases: ['bool']
})
export default class extends Serializer {
	private kTruths = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
	private kFalses = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		const boolean = String(data).toLowerCase();
		if (this.kTruths.has(boolean)) return true;
		if (this.kFalses.has(boolean)) return false;
		throw language.get('resolverInvalidBool', { name: entry.key });
	}

	public stringify(data: string) {
		return data ? 'Enabled' : 'Disabled';
	}
}
