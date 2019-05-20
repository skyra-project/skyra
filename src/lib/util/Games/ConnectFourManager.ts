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
	 * Create a new match for a channel
	 * @param channel The channel to set the match to
	 * @param challenger The challenger KlasaUser instance
	 * @param challengee The challengee KlasaUser instance
	 */
	public create(channel: string, challenger: User, challengee: User): ConnectFour | null {
		const match = new ConnectFour(challenger, challengee);
		this.set(channel, match);
		return match;
	}

}
