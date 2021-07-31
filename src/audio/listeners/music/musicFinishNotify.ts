import { AudioListener } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { resolveKey } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable) {
		const content = await resolveKey(acknowledgeable, LanguageKeys.Commands.Music.PlayEnd);
		await this.reply(acknowledgeable, content);
	}
}
