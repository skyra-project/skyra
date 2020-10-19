import { AudioEvent } from '@lib/structures/AudioEvent';
import { MessageAcknowledgeable } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable) {
		await channel.sendLocale(LanguageKeys.Commands.Music.PauseSuccess);
	}
}
