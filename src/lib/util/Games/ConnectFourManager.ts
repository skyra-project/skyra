import { Client, Collection, User } from 'discord.js';
import { Game } from './ConnectFour/Game';
import { PlayerAI } from './ConnectFour/PlayerAI';
import { Cell } from './ConnectFour/Board';
import { PlayerColor } from './ConnectFour/Player';
import { PlayerHuman } from './ConnectFour/PlayerHuman';
import { KlasaMessage } from 'klasa';

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
	 * @param channel The channel to set the match to
	 * @param challenger The challenger KlasaUser instance
	 * @param challengee The challengee KlasaUser instance
	 */
	public create(message: KlasaMessage, challenger: User, challengee: User): Game | null {
		const skyra = challengee.client.user;
		const game = new Game(message);
		const playerA = challenger === skyra
			? new PlayerAI(game, Cell.PlayerOne, Cell.WinnerPlayerOne, PlayerColor.Blue)
			: new PlayerHuman(game, Cell.PlayerOne, Cell.WinnerPlayerOne, PlayerColor.Blue, challenger);
		const playerB = challengee === skyra
			? new PlayerAI(game, Cell.PlayerTwo, Cell.WinnerPlayerTwo, PlayerColor.Red)
			: new PlayerHuman(game, Cell.PlayerTwo, Cell.WinnerPlayerTwo, PlayerColor.Red, challengee);
		game.setPlayers([playerA, playerB]);
		this.set(message.channel.id, game);
		return game;
	}

}
