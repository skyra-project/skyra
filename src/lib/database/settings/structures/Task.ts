import { Piece } from 'klasa';

/**
 * Base class for all Klasa Task pieces. See {@tutorial CreatingTasks} for more information how to use this class
 * to build custom tasks.
 * @tutorial CreatingTasks
 * @extends {Piece}
 */
export abstract class Task extends Piece {
	/**
	 * The run method to be overwritten in actual Task pieces
	 * @since 0.5.0
	 * @param {*} data The data
	 * @returns {void}
	 * @abstract
	 */
	public run() {
		// Defined in extension Classes
		throw new Error(`The run method has not been implemented by ${this.type}:${this.name}.`);
	}
}
