const { join } = require('path');
const { Collection } = require('discord.js');
const fs = require('fs-nextra');
const Command = require('./Command');
const Store = require('./interfaces/Store');

/**
 * Stores all the commands usable
 * @extends external:Collection
 * @implements {Store}
 */
class CommandStore extends Collection {

	/**
	 * Constructs our CommandStore for use
	 * @param {Skyra} client The Client
     */
	constructor(client) {
		super();
		Object.defineProperty(this, 'client', { value: client });
		this.aliases = new Collection();
		this.baseDir = join(this.client.baseDir, 'commands');
		this.holds = Command;

		/**
		 * The name of what this holds
		 * @type {String}
		 */
		this.name = 'commands';
	}

	/**
     * Returns a command in the store if it exists by its name or by an alias.
     * @param {string} name A command or alias name.
     * @returns {Command}
     */
	get(name) {
		return super.get(name) || this.aliases.get(name);
	}

	/** Returns a boolean if the command or alias is found within the store.
     * @param {string} name A command or alias name
     * @returns {boolean}
     */
	has(name) {
		return super.has(name) || this.aliases.has(name);
	}

	/**
     * Sets up a command in our store.
     * @param {Command} command The command object we are setting up.
     * @returns {Command}
     */
	set(command) {
		if (!(command instanceof Command)) return this.client.emit('log', `Only ${this.name} may be stored in the Store.`, 'error');
		const existing = this.get(command.name);
		if (existing) this.delete(existing);
		super.set(command.name, command);
		for (const alias of command.aliases) this.aliases.set(alias, command);
		return command;
	}

	/**
     * Deletes a command from the store.
     * @param {Command|string} name A command object or a string representing a command or alias name.
     * @returns {boolean} whether or not the delete was successful.
     */
	delete(name) {
		const command = this.resolve(name);
		if (!command) return false;
		super.delete(command.name);
		for (const alias of command.aliases) this.aliases.delete(alias);
		return true;
	}

	/**
     * Clears the commands and aliases from this store
     * @returns {void}
     */
	clear() {
		super.clear();
		this.aliases.clear();
	}

	/**
     * Loads all of our commands from both the user and core directories.
	 * @returns {Promise<number>} The number of commands and aliases loaded.
     */
	async loadAll() {
		this.clear();
		await CommandStore.walk(this, this.baseDir);
		return this.size;
	}

	// left for documentation
	/* eslint-disable no-empty-function */
	init() { }
	resolve() { }
	/* eslint-enable no-empty-function */

	/**
     * Walks our directory of commands for the user and core directories.
     * @param {CommandStore} store The command store we're loading into.
     * @param {string} dir The directory of commands we're using to load commands from.
     * @param {string[]} subs Subfolders for recursion.
     * @returns {void}
     */
	static async walk(store, dir, subs = []) {
		const files = await fs.readdir(join(dir, ...subs)).catch(() => { fs.ensureDir(dir).catch(err => store.client.emit('log', err, 'error')); });
		if (!files) return true;
		return Promise.all(files.map(async file => {
			if (file.endsWith('.js')) return store.load(dir, [...subs, file]);
			return CommandStore.walk(store, dir, [...subs, file]);
		}));
	}

}

Store.applyToClass(CommandStore, ['loadAll']);

module.exports = CommandStore;
