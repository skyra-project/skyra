import { Client, Collection, Message, User } from 'discord.js';
import { Cell } from '../../games/connect-four/Board';
import { Game } from '../../games/connect-four/Game';
import { PlayerColor } from '../../games/connect-four/Player';
import { PlayerHuman } from '../../games/connect-four/PlayerHuman';

export class ConnectFourManager extends Collection<string, Game | null> {
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
	 * @param message The message that is managed by this instance
	 * @param challenger The challenger User instance
	 * @param challengee The challengee User instance
	 */
	public create(message: Message, challenger: User, challengee: User): Game | null {
		const game = new Game(message);
		const playerA = new PlayerHuman(game, Cell.PlayerOne, Cell.WinnerPlayerOne, PlayerColor.Blue, challenger);
		const playerB = new PlayerHuman(game, Cell.PlayerTwo, Cell.WinnerPlayerTwo, PlayerColor.Red, challengee);
		game.setPlayers([playerA, playerB]);
		this.set(message.channel.id, game);
		return game;
	}
}
