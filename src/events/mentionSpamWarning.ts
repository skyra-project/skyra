import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { Event, KlasaMessage } from 'klasa';

export default class extends Event {
	public async run(message: KlasaMessage) {
		await message.alert(message.language.get(LanguageKeys.Monitors.NmsAlert));
	}
}
