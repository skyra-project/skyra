import { Client, Collection, User } from 'discord.js';
import { ConnectFour } from './ConnectFour';

export class ConnectFourManager extends Collection<string, ConnectFour> {

	/**
	 * The Client instance that manages this manager
	 */
	public client: Client;

	public constructor(client: Client) {
		super();
		this.client = client;
	}

	/**
	 * Delete a match
	 * @param channel The channel to delete
	 */
	public delete(channel: string): boolean {
		const match = this.get(channel);
		if (match) {
			this.delete(channel);
			match.dispose();
			return true;
		}
		return false;
	}

	/**
	 * Allocate a match for a channel
	 * @param channel The channel to allocate the channel for
	 * @param challenger The challenger KlasaUser instance
	 * @param challengee The challengee KlasaUser instance
	 */
	public alloc(channel: string, challenger: User, challengee: User): (accept: boolean) => ConnectFour | null {
		if (this.has(channel)) return null;
		this.set(channel, null);
		return this._alloc.bind(this, channel, challenger, challengee);
	}

	/**
	 * Create a new match for a channel
	 * @param channel The channel to set the match to
	 * @param challenger The challenger KlasaUser instance
	 * @param challengee The challengee KlasaUser instance
	 */
	public create(channel: string, challenger: User, challengee: User): ConnectFour | null {
		if (this.has(channel)) return null;
		const match = new ConnectFour(challenger, challengee);
		this.set(channel, match);
		return match;
	}

	/**
	 * If true is passed to accept, this will create a new match.
	 * @param channel The channel to allocate the channel for
	 * @param challenger The challenger KlasaUser instance
	 * @param challengee The challengee KlasaUser instance
	 * @param accept Whether the allocation is accepted
	 */
	private _alloc(channel: string, challenger: User, challengee: User, accept: boolean): ConnectFour | null {
		this.delete(channel);
		if (accept) return this.create(channel, challenger, challengee);
		return null;
	}

}
