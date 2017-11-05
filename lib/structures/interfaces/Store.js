const { join } = require('path');
const fs = require('fs-nextra');
const { applyToClass } = require('../../util/util');

class Store {

	/**
     * Initializes all pieces in this store.
	 * @return {Array}
     */
	init() {
		return Promise.all(this.map(piece => piece.enabled ? piece.init() : true));
	}

	/**
	 * Loads a piece so it can be saved in this store.
     * @param {string} dir The user directory or core directory where this file is saved.
	 * @param  {string|string[]} file A string or array of strings showing where the file is located.
	 * @returns {?Piece}
     */
	load(dir, file) {
		const loc = Array.isArray(file) ? join(dir, ...file) : join(dir, file);
		let piece = null;
		try {
			piece = this.set(new (require(loc))(this.client, dir, file));
		} catch (err) {
			const error = err.message.endsWith('not a constructor') ? new TypeError(`Exported Structure Not A Class`) : err;
			this.client.emit('log', `Failed to load file '${loc}'. Error:\n${error.stack}`, 'wtf');
		}
		delete require.cache[loc];
		return piece;
	}

	/**
     * Loads all of our pieces from both the user and core directories.
	 * @return {number} The number of pieces loaded.
     */
	async loadAll() {
		this.clear();
		const coreFiles = await fs.readdir(this.baseDir).catch(() => { fs.ensureDir(this.baseDir).catch(err => this.client.emit('log', err, 'error')); });
		if (coreFiles) await Promise.all(coreFiles.map(this.load.bind(this, this.baseDir)));
		return this.size;
	}

	/**
     * Resolve a string or piece into a piece object.
     * @param  {Piece|string} name The piece object or a string representing a piece's name
     * @return {Piece}
     */
	resolve(name) {
		if (name instanceof this.holds) return name;
		return this.get(name);
	}

	/**
	 * Defines toString behavior for stores
	 * @returns {string} This store name
	 */
	toString() {
		return this.name;
	}

	/**
     * Applies this interface to a class
     * @param {Object} structure The structure to apply this interface to
     * @param {string[]} [skips=[]] The methods to skip when applying this interface
     */
	static applyToClass(structure, skips) {
		applyToClass(Store, structure, skips);
	}

}

module.exports = Store;
