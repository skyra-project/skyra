import { AudioListener, QueueEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { getAudio } from '#utils/functions';
import { resolveKey } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable, entry: QueueEntry) {
		const [title, requester] = await Promise.all([
			getAudio(acknowledgeable.guild)
				.player.node.decode(entry.track)
				.then((data) => data.title),
			this.container.client.users.fetch(entry.author).then((data) => data.username)
		]);

		const content = await resolveKey(acknowledgeable, LanguageKeys.Commands.Music.RemoveSuccess, { title, requester });
		await this.reply(acknowledgeable, { content, allowedMentions: { users: [], roles: [] } });
	}
}
