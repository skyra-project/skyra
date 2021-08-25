import { AudioListener, NowPlayingEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { resolveKey } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable, entry: NowPlayingEntry) {
		const { username: requester } = await this.container.client.users.fetch(entry.author);
		const { title } = entry.info;

		const content = await resolveKey(acknowledgeable, LanguageKeys.Commands.Music.PlayNext, { title, requester });
		await this.reply(acknowledgeable, { content, allowedMentions: { users: [], roles: [] } });
	}
}
