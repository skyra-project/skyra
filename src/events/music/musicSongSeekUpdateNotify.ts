import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, time: number) {
		await channel.sendLocale(LanguageKeys.Commands.Music.SeekSuccess, [{ time }]);
	}
}
