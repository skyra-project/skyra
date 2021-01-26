import type { NowPlayingEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/structures';
import type { MessageAcknowledgeable } from '#lib/types';

export class UserAudioEvent extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, entry: NowPlayingEntry) {
		const requester = await this.context.client.users.fetch(entry.author).then((data) => data.username);
		const { title } = entry.info;

		await channel.sendTranslated(LanguageKeys.Commands.Music.PlayNext, [{ title, requester }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
