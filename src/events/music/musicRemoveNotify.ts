import { QueueEntry } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, track: readonly QueueEntry[]) {
		await channel.sendLocale(LanguageKeys.Commands.Music.RemoveSuccess, [{ song: track }], { allowedMentions: { users: [], roles: [] } });
	}
}
