import { Track } from 'lavalink';
import { enumerable, showSeconds } from '../../util/util';
import { Queue } from './Queue';
import { UserManagerStore } from './UserManagerStore';

export class Song {

	@enumerable(false)
	public track: string;

	@enumerable(false)
	public requester: string;

	@enumerable(false)
	public queue: Queue;

	public identifier: string;
	public seekable: boolean;
	public author: string;
	public duration: number;
	public stream: boolean;
	public position: number;
	public title: string;
	public url: string;
	public skips: UserManagerStore;

	/**
	 * @param data The retrieved data
	 * @param requester The user that requested this song
	 */
	public constructor(queue: Queue, data: Track, requester: string) {
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
		this.skips = new UserManagerStore(this.queue.client);
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

}
