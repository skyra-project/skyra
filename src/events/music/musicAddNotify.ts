import { QueueEntry } from '@lib/audio';
import { AudioEvent } from '@lib/structures/AudioEvent';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { TextChannel } from 'discord.js';

export default class extends AudioEvent {
	public async run(channel: TextChannel, tracks: readonly QueueEntry[]) {
		await channel.sendMessage(
			tracks.length === 1 ? await this.getSingleTrackContent(channel, tracks) : this.getPlayListContent(channel, tracks),
			{ allowedMentions: { users: [], roles: [] } }
		);
	}

	private async getSingleTrackContent(channel: TextChannel, tracks: readonly QueueEntry[]): Promise<string> {
		const track = await channel.guild.audio.player.node.decode(tracks[0].track);
		return channel.guild.language.get(LanguageKeys.Commands.Music.AddSong, { title: track.title });
	}

	private getPlayListContent(channel: TextChannel, tracks: readonly QueueEntry[]): string {
		return channel.guild.language.get(LanguageKeys.Commands.Music.AddPlaylist, {
			songs: channel.guild.language.get(
				tracks.length === 1 ? LanguageKeys.Commands.Music.AddPlaylistSongs : LanguageKeys.Commands.Music.AddPlaylistSongsPlural,
				{
					count: tracks.length
				}
			)
		});
	}
}
