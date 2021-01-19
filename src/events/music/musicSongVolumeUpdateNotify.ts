import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/structures';
import type { MessageAcknowledgeable } from '#lib/types';
import { pickRandom } from '#utils/util';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, previous: number, next: number) {
		await channel.send(next > 200 ? await this.getExtremeVolume(channel, next) : await this.getRegularVolume(channel, previous, next));
	}

	private async getExtremeVolume(channel: MessageAcknowledgeable, volume: number): Promise<string> {
		const t = await channel.guild.fetchT();
		return t(LanguageKeys.Commands.Music.VolumeChangedExtreme, {
			emoji: '📢',
			text: pickRandom(t(LanguageKeys.Commands.Music.VolumeChangedTexts)),
			volume
		});
	}

	private async getRegularVolume(channel: MessageAcknowledgeable, previous: number, next: number): Promise<string> {
		const t = await channel.guild.fetchT();
		return t(LanguageKeys.Commands.Music.VolumeChanged, {
			emoji: this.getEmoji(previous, next),
			volume: next
		});
	}

	private getEmoji(previous: number, next: number): string {
		return next > previous ? (next === 200 ? '📢' : '🔊') : next === 0 ? '🔇' : '🔉';
	}
}
