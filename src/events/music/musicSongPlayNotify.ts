import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TrackInfo } from '@skyra/audio';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, track: TrackInfo) {
		const { title } = track;
		const requester = (await this.client.users.fetch(track.author)).username;
		await channel.sendLocale(LanguageKeys.Commands.Music.PlayNext, [{ title, requester }], {
			allowedMentions: { users: [], roles: [] }
		});
	}
}
