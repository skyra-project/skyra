import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, repeating: boolean) {
		await channel.sendLocale(repeating ? LanguageKeys.Commands.Music.RepeatSuccessEnabled : LanguageKeys.Commands.Music.RepeatSuccessDisabled);
	}
}
