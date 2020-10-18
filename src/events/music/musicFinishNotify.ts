import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import type { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel) {
		await channel.sendLocale(LanguageKeys.Commands.Music.PlayEnd);
	}
}
