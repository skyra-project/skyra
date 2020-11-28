import { QueueEntry } from '#lib/audio/index';
import { AudioEvent } from '#lib/structures/AudioEvent';
import { MessageAcknowledgeable } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, entry: QueueEntry) {
		const track = await channel.guild.audio.player.node.decode(entry.track);
		await channel.sendLocale(LanguageKeys.Commands.Music.SkipSuccess, [{ title: track.title }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
