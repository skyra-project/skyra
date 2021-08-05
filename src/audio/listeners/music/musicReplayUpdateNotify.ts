import { AudioListener } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { resolveKey } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable, repeating: boolean) {
		const content = await resolveKey(
			acknowledgeable,
			repeating ? LanguageKeys.Commands.Music.RepeatSuccessEnabled : LanguageKeys.Commands.Music.RepeatSuccessDisabled
		);
		await this.reply(acknowledgeable, content);
	}
}
