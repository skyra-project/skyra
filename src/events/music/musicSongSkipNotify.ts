import { QueueEntry } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, entry: QueueEntry) {
		const track = await channel.guild.audio.player.node.decode(entry.track);
		await channel.sendLocale(LanguageKeys.Commands.Music.SkipSuccess, [{ title: track.title }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
