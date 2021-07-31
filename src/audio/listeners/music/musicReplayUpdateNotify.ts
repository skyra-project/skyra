import { AudioListener } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';

export class UserAudioListener extends AudioListener {
	public async run(channel: MessageAcknowledgeable, repeating: boolean) {
		await channel.sendTranslated(
			repeating ? LanguageKeys.Commands.Music.RepeatSuccessEnabled : LanguageKeys.Commands.Music.RepeatSuccessDisabled
		);
	}
}
