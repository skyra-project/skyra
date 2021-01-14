import { QueueEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { MessageAcknowledgeable } from '#lib/types';

export default class extends AudioEvent {
	public async run(channel: MessageAcknowledgeable, tracks: readonly QueueEntry[]) {
		await channel.send(tracks.length === 1 ? await this.getSingleTrackContent(channel, tracks) : await this.getPlayListContent(channel, tracks), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	private async getSingleTrackContent(channel: MessageAcknowledgeable, tracks: readonly QueueEntry[]): Promise<string> {
		const [track, t] = await Promise.all([channel.guild.audio.player.node.decode(tracks[0].track), channel.guild.fetchT()]);
		return t(LanguageKeys.Commands.Music.AddSong, { title: track.title });
	}

	private async getPlayListContent(channel: MessageAcknowledgeable, tracks: readonly QueueEntry[]): Promise<string> {
		const t = await channel.guild.fetchT();
		return t(LanguageKeys.Commands.Music.AddPlaylist, {
			songs: t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count: tracks.length })
		});
	}
}
