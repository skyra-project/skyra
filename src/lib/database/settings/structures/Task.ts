import { ResponseType, type PartialResponseValue } from '#lib/database/entities';
import { Piece } from '@sapphire/framework';
import type { Awaitable } from '@sapphire/utilities';

export abstract class Task extends Piece {
	/**
	 * The run method to be overwritten in actual Task pieces
	 * @param data The data
	 */
	public abstract run(data: unknown): Awaitable<PartialResponseValue | null>;

	protected ignore() {
		return { type: ResponseType.Ignore } as const;
	}

	protected finish() {
		return { type: ResponseType.Finished } as const;
	}

	protected delay(value: number) {
		return { type: ResponseType.Delay, value } as const;
	}

	protected update(value: Date) {
		return { type: ResponseType.Update, value } as const;
	}
}

export namespace Task {
	export type Options = Piece.Options;
}
