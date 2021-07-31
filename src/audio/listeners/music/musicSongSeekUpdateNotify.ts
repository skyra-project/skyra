import { AudioListener } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';

export class UserAudioListener extends AudioListener {
	public async run(channel: MessageAcknowledgeable, time: number) {
		await channel.sendTranslated(LanguageKeys.Commands.Music.SeekSuccess, [{ time }]);
	}
}
