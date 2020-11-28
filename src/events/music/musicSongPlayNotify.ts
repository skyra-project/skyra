import { NowPlayingEntry } from '#lib/audio/index';
import { AudioEvent } from '#lib/structures/AudioEvent';
import { MessageAcknowledgeable } from '#lib/types/index';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, entry: NowPlayingEntry) {
		const requester = await this.client.users.fetch(entry.author).then((data) => data.username);
		const { title } = entry.info;

		await channel.sendLocale(LanguageKeys.Commands.Music.PlayNext, [{ title, requester }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
