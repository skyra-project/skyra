import { Guild, TextChannel, VoiceChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';
import { LoadType, Status, Track } from 'lavalink';
import { Events } from '../../types/Enums';
import { enumerable } from '../../util/util';
import { Song } from './Song';
import { SkyraClient } from '../../SkyraClient';
import { SubscriptionName } from '../../websocket/types';

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

	public get status() {
		const { player } = this;
		return player ? player.status : Status.ENDED;
	}

	public get canPlay() { return Boolean(this.song || this.queue.length); }
	public get playing() { return this.status === Status.PLAYING; }
	public get paused() { return this.status === Status.PAUSED; }
	public get ended() { return this.status === Status.ENDED; }

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

	public get connection() {
		const { voiceChannel } = this;
		return (voiceChannel && voiceChannel.connection) || null;
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

	public add(user: string, song: Track): Song;
	public add(user: string, song: Track[]): Song[];
	public add(user: string, song: Track | Track[]) {
		if (Array.isArray(song)) {
			const parsedSongs = song.map(info => new Song(this, info, user));
			this.queue.push(...parsedSongs);
			this.client.emit(Events.MusicAdd, this, parsedSongs);
			return parsedSongs;
		}

		const parsedSong = new Song(this, song, user);
		this.queue.push(parsedSong);
		this.client.emit(Events.MusicAdd, this, [parsedSong]);
		return parsedSong;
	}

	public async fetch(song: string) {
		const response = await this.client.lavalink!.load(song);
		if (response.loadType === LoadType.NO_MATCHES) throw this.guild.language.tget('MUSICMANAGER_FETCH_NO_MATCHES');
		if (response.loadType === LoadType.LOAD_FAILED) throw this.guild.language.tget('MUSICMANAGER_FETCH_LOAD_FAILED');
		return response.tracks;
	}

	public setReplay(value: boolean) {
		if (this.replay !== value) {
			this.replay = value;
			this.client.emit(Events.MusicReplayUpdate, this, value);
		}
		return this;
	}

	public async setVolume(volume: number) {
		if (volume <= 0) throw this.guild.language.tget('MUSICMANAGER_SETVOLUME_SILENT');
		if (volume > 200) throw this.guild.language.tget('MUSICMANAGER_SETVOLUME_LOUD');
		await this.player.setVolume(volume);
		this.client.emit(Events.MusicSongVolumeUpdate, this, this.volume, volume);
		this.volume = volume;
		return this;
	}

	public async seek(position: number) {
		const { player } = this;
		if (player) {
			await player.seek(position);
			this.client.emit(Events.MusicSongSeekUpdate, this, position);
		}
		return this;
	}

	public async connect(voiceChannel: VoiceChannel) {
		await this.player.join(voiceChannel.id, { deaf: true });
		this.client.emit(Events.MusicConnect, this, voiceChannel);
		return this;
	}

	public async leave() {
		const { voiceChannel } = this;
		await this.player.leave();
		this.client.emit(Events.MusicLeave, this, voiceChannel);
		return this;
	}

	public async play() {
		if (!this.queue.length) return Promise.reject(this.guild.language.tget('MUSICMANAGER_PLAY_NO_SONGS'));
		if (this.playing) return Promise.reject(this.guild.language.tget('MUSICMANAGER_PLAY_PLAYING'));

		this.song = this.queue.shift()!;
		await this.player.play(this.song.track);

		this.client.emit(Events.MusicSongPlay, this, this.song);
		return this;
	}

	public async pause(systemPaused = false) {
		if (!this.paused) {
			await this.player.pause(true);
			this.systemPaused = systemPaused;
			this.client.emit(Events.MusicSongPause, this);
		}
		return this;
	}

	public async resume() {
		if (!this.playing) {
			await this.player.pause(false);
			this.client.emit(Events.MusicSongResume, this);
			this.systemPaused = false;
		}
		return this;
	}

	public async skip() {
		if (this.song !== null) {
			await this.player.stop();
			this.client.emit(Events.MusicSongSkip, this, this.song);
		}
		return this;
	}

	public prune() {
		this.client.emit(Events.MusicPrune, this);
		return this;
	}

	public shuffle() {
		let m = this.queue.length;
		while (m) {
			const i = Math.floor(Math.random() * m--);
			[this.queue[m], this.queue[i]] = [this.queue[i], this.queue[m]];
		}
		this.client.emit(Events.MusicShuffleQueue, this);
		return this.queue;
	}

	public reset(volume = false) {
		this.song = null;
		this.position = 0;
		this.lastUpdate = 0;
		this.systemPaused = false;
		this.replay = false;
		if (volume) this.volume = 100;
	}

	public async manageableFor(message: KlasaMessage) {
		if (message.member!.isDJ) return true;
		// If the current song and all queued songs are requested by the author, the queue is still manageable.
		if ((this.song ? this.song.requester === message.author.id : true) && this.queue.every(song => song.requester === message.author.id)) return true;
		// Else if the author is a moderator+, queues are always manageable for them.
		return message.hasAtLeastPermissionLevel(5);
	}

	public *websocketUserIterator() {
		for (const user of this.client.websocket.users.values()) {
			if (user.subscriptions.some(subscription => subscription.type === SubscriptionName.Music && subscription.guild_id === this.guild.id)) {
				yield user;
			}
		}
	}

	public toJSON() {
		return {
			length: this.queue.length,
			voiceChannel: this.voiceChannel,
			playing: this.playing,
			song: this.song,
			position: this.position,
			status: this.status,
			queue: this.queue
		};
	}

}
