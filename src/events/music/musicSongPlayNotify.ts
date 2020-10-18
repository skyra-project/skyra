import { QueueEntry } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, entry: QueueEntry) {
		const [title, requester] = await Promise.all([
			channel.guild.audio.player.node.decode(entry.track).then((data) => data.title),
			this.client.users.fetch(entry.author).then((data) => data.username)
		]);
		await channel.sendLocale(LanguageKeys.Commands.Music.PlayNext, [{ title, requester }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
