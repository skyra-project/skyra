import { SkyraClient } from '@lib/SkyraClient';
import { Events } from '@lib/types/Enums';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { SubscriptionName } from '@lib/websocket/types';
import { flattenMusicHandler } from '@utils/Models/ApiTransform';
import { enumerable } from '@utils/util';
import { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { LoadType, Status, Track } from 'lavalink';
import { Song } from './Song';

export class MusicHandler {

	@enumerable(false)
	public client: SkyraClient;

	@enumerable(false)
	public guild: Guild;

	@enumerable(false)
	public channelID: string | null = null;

	@enumerable(false)
	public systemPaused = false;

	public queue: Song[] = [];
	public volume = 100;
	public replay = false;
	public song: Song | null = null;

	public get player() {
		return this.client.lavalink!.players.get(this.guild.id);
	}

	public get canPlay() { return Boolean(this.song || this.queue.length); }
	public get playing() { return this.player.status === Status.PLAYING; }
	public get paused() { return this.player.status === Status.PAUSED; }
	public get ended() { return this.player.status === Status.ENDED; }

	public get channel() {
		return (this.channelID && this.client.channels.get(this.channelID) as TextChannel) || null;
	}

	public get playingTime() {
		return this.lastUpdate ? this.position + (Date.now() - this.lastUpdate) : 0;
	}

	public get trackRemaining() {
		return this.song ? this.song.duration - this.playingTime : 0;
	}

	public get voiceChannel() {
		return this.guild.me!.voice.channel;
	}

	public get listeners(): readonly string[] {
		const { voiceChannel } = this;
		if (voiceChannel) {
			const members: string[] = [];
			for (const [id, member] of voiceChannel.members) {
				if (member.user.bot || member.voice.deaf) continue;
				members.push(id);
			}
			return members;
		}
		return [];
	}

	@enumerable(false)
	public position = 0;

	@enumerable(false)
	public lastUpdate = 0;

	public constructor(guild: Guild) {
		this.client = guild.client as SkyraClient;
		this.guild = guild;
	}

	public add(user: string, song: Track[], context: MusicHandlerRequestContext | null = null) {
		const parsedSongs = song.map(info => new Song(this, info, user));
		this.queue.push(...parsedSongs);
		this.client.emit(Events.MusicAdd, this, parsedSongs, context);
		return parsedSongs;
	}

	public async fetch(song: string) {
		const response = await this.client.lavalink!.load(song);
		if (response.loadType === LoadType.NO_MATCHES) throw this.guild.language.tget('MUSICMANAGER_FETCH_NO_MATCHES');
		if (response.loadType === LoadType.LOAD_FAILED) throw this.guild.language.tget('MUSICMANAGER_FETCH_LOAD_FAILED');
		return response.tracks;
	}

	public setReplay(value: boolean, context: MusicHandlerRequestContext | null = null) {
		if (this.replay !== value) {
			this.replay = value;
			this.client.emit(Events.MusicReplayUpdate, this, value, context);
		}
		return this;
	}

	public async setVolume(volume: number, context: MusicHandlerRequestContext | null = null) {
		if (volume <= 0) throw this.guild.language.tget('MUSICMANAGER_SETVOLUME_SILENT');
		if (volume > 200) throw this.guild.language.tget('MUSICMANAGER_SETVOLUME_LOUD');
		await this.player.setVolume(volume);
		this.client.emit(Events.MusicSongVolumeUpdate, this, this.volume, volume, context);
		this.volume = volume;
		return this;
	}

	public async seek(position: number, context: MusicHandlerRequestContext | null = null) {
		const { player } = this;
		if (player) {
			await player.seek(position);
			this.client.emit(Events.MusicSongSeekUpdate, this, position, context);
		}
		return this;
	}

	public async connect(voiceChannel: VoiceChannel, context: MusicHandlerRequestContext | null = null) {
		await this.player.join(voiceChannel.id, { deaf: true });
		this.client.emit(Events.MusicConnect, this, voiceChannel, context);
		return this;
	}

	public async leave(context: MusicHandlerRequestContext | null = null) {
		const { voiceChannel } = this;
		await this.player.destroy();
		await this.player.leave();
		this.client.emit(Events.MusicLeave, this, voiceChannel, context);
		this.channelID = null;
		this.song = null;
		return this;
	}

	public async play() {
		if (!this.queue.length) return Promise.reject(this.guild.language.tget('MUSICMANAGER_PLAY_NO_SONGS'));
		if (this.playing) return Promise.reject(this.guild.language.tget('MUSICMANAGER_PLAY_PLAYING'));

		this.song = this.queue.shift()!;
		await this.player.play(this.song.track);

		return this;
	}

	public async pause(systemPaused = false, context: MusicHandlerRequestContext | null = null) {
		if (!this.paused) {
			await this.player.pause(true);
			this.systemPaused = systemPaused;
			this.client.emit(Events.MusicSongPause, this, context);
		}
		return this;
	}

	public async resume(context: MusicHandlerRequestContext | null = null) {
		if (!this.playing) {
			await this.player.pause(false);
			this.client.emit(Events.MusicSongResume, this, context);
		}
		return this;
	}

	public async skip(context: MusicHandlerRequestContext | null = null) {
		if (this.song !== null) {
			await this.player.stop();
			this.client.emit(Events.MusicSongSkip, this, this.song, context);
		}
		return this;
	}

	public prune(context: MusicHandlerRequestContext | null = null) {
		this.client.emit(Events.MusicPrune, this, context);
		return this;
	}

	public shuffle(context: MusicHandlerRequestContext | null = null) {
		let m = this.queue.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[this.queue[m], this.queue[i]] = [this.queue[i], this.queue[m]];
		}
		this.client.emit(Events.MusicShuffleQueue, this, context);
		return this.queue;
	}

	public reset(volume = false) {
		this.song = null;
		this.position = 0;
		this.lastUpdate = 0;
		this.systemPaused = false;
		this.replay = false;
		if (volume) this.volume = this.guild.settings.get(GuildSettings.Music.DefaultVolume);
	}

	public async manageableFor(message: KlasaMessage) {
		const { listeners } = this;

		// If the member is the only listener, they receive full permissions on them.
		if (listeners.length === 0 && listeners[0] === message.author.id) return true;
		// If the member is a DJ, queues are always manageable for them.
		if (message.member!.isDJ) return true;
		// If the current song and all queued songs are requested by the author, the queue is still manageable.
		if ((this.song ? this.song.requester === message.author.id : true) && this.queue.every(song => song.requester === message.author.id)) return true;
		// Else if the author is a moderator+, queues are always manageable for them.
		return message.hasAtLeastPermissionLevel(5);
	}

	public *websocketUserIterator() {
		for (const user of this.client.websocket.users.values()) {
			if (user.subscriptions.some(sub => sub.type === SubscriptionName.Music && sub.guild_id === this.guild.id)) {
				yield user;
			}
		}
	}

	public toJSON() {
		return flattenMusicHandler(this);
	}

}

export interface MusicHandlerRequestContext {
	channel?: TextChannel;
	userID: string;
}
