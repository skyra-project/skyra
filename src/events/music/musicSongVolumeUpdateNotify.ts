import { AudioEvent } from '#lib/structures/AudioEvent';
import { MessageAcknowledgeable } from '#lib/types';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { pickRandom } from '#utils/util';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, previous: number, next: number) {
		await channel.send(next > 200 ? await this.getExtremeVolume(channel, next) : await this.getRegularVolume(channel, previous, next));
	}

	private async getExtremeVolume(channel: MessageAcknowledgeable, volume: number): Promise<string> {
		const language = await channel.guild.fetchLanguage();
		return language.get(LanguageKeys.Commands.Music.VolumeChangedExtreme, {
			emoji: '📢',
			text: pickRandom(language.get(LanguageKeys.Commands.Music.VolumeChangedTexts)),
			volume
		});
	}

	private getRegularVolume(channel: MessageAcknowledgeable, previous: number, next: number): Promise<string> {
		return channel.guild.fetchLocale(LanguageKeys.Commands.Music.VolumeChanged, {
			emoji: this.getEmoji(previous, next),
			volume: next
		});
	}

	private getEmoji(previous: number, next: number): string {
		return next > previous ? (next === 200 ? '📢' : '🔊') : next === 0 ? '🔇' : '🔉';
	}
}
