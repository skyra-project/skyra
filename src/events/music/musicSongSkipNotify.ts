import { QueueEntry } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { MessageAcknowledgeable } from '#lib/types';
import { LanguageKeys } from '#lib/i18n/languageKeys';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, entry: QueueEntry) {
		const track = await channel.guild.audio.player.node.decode(entry.track);
		await channel.sendTranslated(LanguageKeys.Commands.Music.SkipSuccess, [{ title: track.title }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
