const { join } = require('path');
const { Collection } = require('discord.js');
const { Store } = require('klasa');
const { readdir, ensureDir } = require('fs-nextra');
const API = require('./API');

class APIStore extends Collection {

	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });
		this.userDir = join(this.client.clientBaseDir, 'api');
		this.holds = API;
		this.name = 'api';
	}

	/**
	 * Run the router
	 * @since 3.0.0
	 * @param {*} data The data to process
	 * @returns {Promise<{ response: string, success: boolean }>}
	 */
	async run(data) {
		const _result = (router => router ? router.run(data) : null)(this.get(data.route));
		const result = _result && _result instanceof Promise ? await _result : _result;
		if (!result) return { response: 'NO MATCH', success: false };
		return { response: typeof result === 'string' ? result : JSON.stringify(result), success: true };
	}

	delete(name) {
		const piece = this.resolve(name);
		if (!piece) return false;
		super.delete(piece.name);
		return true;
	}

	set(piece) {
		if (!(piece instanceof this.holds)) {
			return this.client.emit('error', `Only ${this.name} may be stored in the Store.`);
		}
		const existing = this.get(piece.name);
		if (existing) this.delete(existing);
		super.set(piece.name, piece);
		return piece;
	}

	/**
	 * Loads all of our commands from both the user and core directories.
	 * @since 0.0.1
	 * @returns {number} The number of commands and aliases loaded.
	 */
	async loadAll() {
		this.clear();
		await APIStore.walk(this, this.userDir);
		return this.size;
	}

	// Technically left for more than just documentation
	/* eslint-disable no-empty-function */
	init() { }
	load() { }
	resolve() { }
	/* eslint-enable no-empty-function */

	/**
	 * Walks our directory of commands for the user and core directories.
	 * @since 0.0.1
	 * @param {CommandStore} store The command store we're loading into
	 * @param {string} dir The directory of commands we're using to load commands from
	 * @param {string[]} subs Subfolders for recursion
	 * @returns {void}
	 */
	static async walk(store, dir, subs = []) {
		const files = await readdir(join(dir, ...subs)).catch(() => { ensureDir(dir).catch(err => store.client.emit('error', err)); });
		if (!files) return true;
		return Promise.all(files.map(async file => {
			if (file.endsWith('.js')) return store.load(dir, [...subs, file]);
			return APIStore.walk(store, dir, [...subs, file]);
		}));
	}

}

Store.applyToClass(APIStore);

module.exports = APIStore;
