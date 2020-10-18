import { AudioEvent } from '@lib/structures/AudioEvent';
import { MessageAcknowledgeable } from '@lib/types';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { pickRandom } from '@utils/util';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, previous: number, next: number) {
		await channel.sendMessage(next > 200 ? this.getExtremeVolume(channel, next) : this.getRegularVolume(channel, previous, next));
	}

	private getExtremeVolume(channel: MessageAcknowledgeable, volume: number): string {
		return channel.guild.language.get(LanguageKeys.Commands.Music.VolumeChangedExtreme, {
			emoji: '📢',
			text: pickRandom(channel.guild.language.get(LanguageKeys.Commands.Music.VolumeChangedTexts)),
			volume
		});
	}

	private getRegularVolume(channel: MessageAcknowledgeable, previous: number, next: number): string {
		return channel.guild.language.get(LanguageKeys.Commands.Music.VolumeChanged, {
			emoji: this.getEmoji(previous, next),
			volume: next
		});
	}

	private getEmoji(previous: number, next: number): string {
		return next > previous ? (next === 200 ? '📢' : '🔊') : next === 0 ? '🔇' : '🔉';
	}
}
