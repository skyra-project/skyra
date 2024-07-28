import type { Schedule } from '@prisma/client';
import { Piece } from '@sapphire/framework';
import type { Awaitable } from '@sapphire/utilities';

export abstract class Task extends Piece {
	/**
	 * The run method to be overwritten in actual Task pieces
	 * @param data The data
	 */
	public abstract run(data: unknown): Awaitable<Task.PartialResponseValue | null>;
}

export namespace Task {
	export type Options = Piece.Options;

	export const enum ResponseType {
		Ignore,
		Delay,
		Update,
		Finished
	}

	export type PartialResponseValue =
		| { type: ResponseType.Ignore | ResponseType.Finished }
		| { type: ResponseType.Delay; value: number }
		| { type: ResponseType.Update; value: Date };

	export type ResponseValue = PartialResponseValue & { entry: Schedule };
}
