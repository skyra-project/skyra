import type { QueueEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/structures';
import type { MessageAcknowledgeable } from '#lib/types';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, entry: QueueEntry) {
		const track = await channel.guild.audio.player.node.decode(entry.track);
		await channel.sendTranslated(LanguageKeys.Commands.Music.SkipSuccess, [{ title: track.title }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
