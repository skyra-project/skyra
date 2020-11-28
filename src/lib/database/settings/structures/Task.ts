import { Piece } from 'klasa';
import type { PartialResponseValue } from '#lib/database';
import type { Awaited } from '@sapphire/utilities';

export abstract class Task extends Piece {
	/**
	 * The run method to be overwritten in actual Task pieces
	 * @param data The data
	 */
	public abstract run(data: unknown): Awaited<PartialResponseValue | null>;
}
