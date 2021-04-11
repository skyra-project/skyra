import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/audio';
import type { MessageAcknowledgeable } from '#lib/types';

export class UserAudioEvent extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, repeating: boolean) {
		await channel.sendTranslated(
			repeating ? LanguageKeys.Commands.Music.RepeatSuccessEnabled : LanguageKeys.Commands.Music.RepeatSuccessDisabled
		);
	}
}
