import { AudioListener } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { pickRandom } from '#utils/util';
import { fetchT } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable, previous: number, next: number) {
		const content =
			next > 200 ? await this.getExtremeVolume(acknowledgeable, next) : await this.getRegularVolume(acknowledgeable, previous, next);
		await this.reply(acknowledgeable, content);
	}

	private async getExtremeVolume(acknowledgeable: MessageAcknowledgeable, volume: number): Promise<string> {
		const t = await fetchT(acknowledgeable);
		return t(LanguageKeys.Commands.Music.VolumeChangedExtreme, {
			emoji: '📢',
			text: pickRandom(t(LanguageKeys.Commands.Music.VolumeChangedTexts)),
			volume
		});
	}

	private async getRegularVolume(acknowledgeable: MessageAcknowledgeable, previous: number, next: number): Promise<string> {
		const t = await fetchT(acknowledgeable);
		return t(LanguageKeys.Commands.Music.VolumeChanged, {
			emoji: this.getEmoji(previous, next),
			volume: next
		});
	}

	private getEmoji(previous: number, next: number): string {
		return next > previous ? (next === 200 ? '📢' : '🔊') : next === 0 ? '🔇' : '🔉';
	}
}
