import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/structures';
import type { MessageAcknowledgeable } from '#lib/types';

export class UserAudioEvent extends AudioEvent {
	public async run(channel: MessageAcknowledgeable) {
		await channel.sendTranslated(LanguageKeys.Commands.Music.PauseSuccess);
	}
}
