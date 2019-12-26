import { Track } from 'lavalink';
import { enumerable, showSeconds, cleanMentions } from '../../util/util';
import { MusicHandler } from './MusicHandler';
import { Util } from 'discord.js';

export class Song {

	@enumerable(false)
	public id: string;

	@enumerable(false)
	public track: string;

	@enumerable(false)
	public requester: string;

	@enumerable(false)
	public queue: MusicHandler;

	public identifier: string;
	public seekable: boolean;
	public author: string;
	public duration: number;
	public stream: boolean;
	public position: number;
	public title: string;
	public url: string;
	public skips = new Set<string>();

	/**
	 * @param queue The queue that manages this song.
	 * @param data The retrieved data.
	 * @param requester The user that requested this song.
	 */
	public constructor(queue: MusicHandler, data: Track, requester: string) {
		this.id = Song.generateID(requester);
		this.queue = queue;
		this.track = data.track;
		this.requester = requester;
		this.identifier = data.info.identifier;
		this.seekable = data.info.isSeekable;
		this.author = data.info.author;
		this.duration = data.info.length;
		this.stream = data.info.isStream;
		this.position = data.info.position;
		this.title = data.info.title;
		this.url = data.info.uri;
	}

	/**
	 * The cleaned and escaped title
	 */
	public get safeTitle() {
		return cleanMentions(this.queue.guild, Util.escapeMarkdown(this.title));
	}

	public get friendlyDuration(): string {
		return showSeconds(this.duration);
	}

	public async fetchRequester() {
		try {
			return await this.queue.client.users.fetch(this.requester);
		} catch {
			return null;
		}
	}

	public toString(): string {
		return `<${this.url}>`;
	}

	private static counter = 0;

	private static generateID(author: string) {
		if (++Song.counter === 0xFFFFFF) Song.counter = 0;
		return Buffer.from(`${author}.${Song.counter}.${Date.now()}`).toString('base64');
	}

}
