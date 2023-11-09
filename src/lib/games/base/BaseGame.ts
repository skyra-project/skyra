import type { BaseController } from '#lib/games/base/BaseController';
import type { TFunction } from '@sapphire/plugin-i18next';
import { fetchT } from '@sapphire/plugin-i18next';
import type { Client, Message } from 'discord.js';

export const enum GameTurn {
	PlayerA,
	PlayerB
}

export const enum GameStatus {
	Start,
	Update,
	End
}

export abstract class BaseGame<T> {
	public message: Message;
	public t: TFunction = null!;
	public readonly playerA: BaseController<T>;
	public readonly playerB: BaseController<T>;
	public turn: GameTurn;

	public constructor(message: Message, playerA: BaseController<T>, playerB: BaseController<T>, turn = BaseGame.getTurn()) {
		this.message = message;
		this.playerA = playerA.setTurn(GameTurn.PlayerA).setGame(this);
		this.playerB = playerB.setTurn(GameTurn.PlayerB).setGame(this);
		this.turn = turn;
	}

	protected abstract get finished(): boolean;

	protected get player(): BaseController<T> {
		return this.turn === GameTurn.PlayerA ? this.playerA : this.playerB;
	}

	protected get client(): Client {
		return this.message.client;
	}

	public async run() {
		this.t = await fetchT(this.message);
		await this.onStart();

		while (true) {
			// Read player's move:
			const { player } = this;
			const value = await player.await();
			await this.handle(value, player);

			// If finished, break loop:
			if (this.finished) break;

			// Query an update and switch player:
			this.nextPlayer();
			await this.onUpdate();
		}

		await this.onEnd();
	}

	protected nextPlayer() {
		this.turn = this.turn === GameTurn.PlayerA ? GameTurn.PlayerB : GameTurn.PlayerA;
	}

	protected abstract handle(value: T, player: BaseController<T>): unknown;

	protected onStart(): Promise<unknown> {
		return this.message.edit({ content: this.render(GameStatus.Start), embeds: [], attachments: [] });
	}

	protected onUpdate(): Promise<unknown> {
		return this.message.edit({ content: this.render(GameStatus.Update), embeds: [], attachments: [] });
	}

	protected onEnd(): Promise<unknown> {
		return this.message.edit({ content: this.render(GameStatus.End), embeds: [], attachments: [] });
	}

	protected abstract render(status: GameStatus): string;

	protected static getTurn(): GameTurn {
		return Math.random() < 0.5 ? GameTurn.PlayerA : GameTurn.PlayerB;
	}
}
