import { ApplyOptions } from '@skyra/decorators';
import { Serializer, SerializerOptions, SerializerUpdateContext } from 'klasa';

const truths = new Set(['true', 't', 'yes', 'y', 'on', 'enable', 'enabled', '1', '+']);
const falses = new Set(['false', 'f', 'no', 'n', 'off', 'disable', 'disabled', '0', '-']);

@ApplyOptions<SerializerOptions>({
	aliases: ['bool']
})
export default class extends Serializer {

	public validate(data: string, { entry, language }: SerializerUpdateContext) {
		const boolean = String(data).toLowerCase();
		if (truths.has(boolean)) return true;
		if (falses.has(boolean)) return false;
		throw language.tget('RESOLVER_INVALID_BOOL', entry.key);
	}

	public stringify(data: string) {
		return data ? 'Enabled' : 'Disabled';
	}

}
