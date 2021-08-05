import { AudioListener, QueueEntry } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import type { MessageAcknowledgeable } from '#lib/types';
import { getAudio } from '#utils/functions';
import { fetchT, TFunction } from '@sapphire/plugin-i18next';

export class UserAudioListener extends AudioListener {
	public async run(acknowledgeable: MessageAcknowledgeable, tracks: readonly QueueEntry[]) {
		const t = await fetchT(acknowledgeable.guild);
		const content = tracks.length === 1 ? await this.getSingleTrackContent(t, acknowledgeable, tracks) : this.getPlayListContent(t, tracks);
		await this.reply(acknowledgeable, { content, allowedMentions: { users: [], roles: [] } });
	}

	private async getSingleTrackContent(t: TFunction, acknowledgeable: MessageAcknowledgeable, tracks: readonly QueueEntry[]): Promise<string> {
		const track = await getAudio(acknowledgeable.guild).player.node.decode(tracks[0].track);
		return t(LanguageKeys.Commands.Music.AddSong, { title: track.title });
	}

	private getPlayListContent(t: TFunction, tracks: readonly QueueEntry[]): string {
		return t(LanguageKeys.Commands.Music.AddPlaylist, { songs: t(LanguageKeys.Commands.Music.AddPlaylistSongs, { count: tracks.length }) });
	}
}
