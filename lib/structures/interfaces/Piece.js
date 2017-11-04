const { applyToClass } = require('../../util/util');

/**
 * The common interface for all pieces
 * @see Command
 * @see Event
 * @see Extendable
 * @see Finalizer
 * @see Inhibitor
 * @see Monitor
 * @see Provider
 */
class Piece {

	/**
     * Reloads this piece
     * @returns {Promise<Piece>} The newly loaded piece
     */
	async reload() {
		const piece = this.client[`${this.type}s`].load(this.dir, this.file);
		await piece.init();
		return piece;
	}

	/**
     * Unloads this piece
     * @returns {void}
     */
	unload() {
		return this.client[`${this.type}s`].delete(this);
	}

	/**
     * Disables this piece
     * @returns {Piece} This piece
     */
	disable() {
		this.enabled = false;
		return this;
	}

	/**
     * Enables this piece
     * @returns {Piece} This piece
     */
	enable() {
		this.enabled = true;
		return this;
	}

	/**
     * Applies this interface to a class
     * @param {Object} structure The structure to apply this interface to
     * @param {string[]} [skips=[]] The methods to skip when applying this interface
     */
	static applyToClass(structure, skips) {
		applyToClass(Piece, structure, skips);
	}

}

module.exports = Piece;
