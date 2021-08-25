import { AudioListener, QueueEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { getAudio } from '#utils/functions';
import { resolveKey } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable, entry: QueueEntry) {
		const { title } = await getAudio(acknowledgeable.guild).player.node.decode(entry.track);
		const content = await resolveKey(acknowledgeable, LanguageKeys.Commands.Music.SkipSuccess, { title });
		await this.reply(acknowledgeable, { content, allowedMentions: { users: [], roles: [] } });
	}
}
