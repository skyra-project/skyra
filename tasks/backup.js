const { Task, Timestamp } = require('klasa');
const { outputJSONAtomic, readJSON, remove, exists } = require('fs-nextra');
const { join } = require('path');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);
		this.timestamp = new Timestamp('YYYY-MM-DD');
	}

	get dirManager() {
		return join(this.client.clientBaseDir, 'bwd', 'backups');
	}

	get fileManager() {
		return join(this.dirManager, 'backups.json');
	}

	async run() {
		this.disable();
		const paths = await Promise.all([
			this.backup('json', 'clientStorage'),
			this.backup('rethinkdb', 'localScores'),
			this.backup('rethinkdb', 'users'),
			this.backup('rethinkdb', 'guilds'),
			this.backup('rethinkdb', 'moderation'),
			this.backup('rethinkdb', 'starboard')
		]);
		await this.writeFile(paths);
		this.enable();
	}

	// Remove old backups to save space
	async writeFile(paths) {
		const data = await readJSON(this.fileManager);

		// Update the timestamp to latest
		data.lastUpdated = Date.now();
		data.backups.push(paths);
		if (data.backups.length > 4) {
			const oldPaths = data.backups.splice(0, 1);
			await Promise.all(oldPaths.map(path => remove(path)));
		}

		await outputJSONAtomic(this.fileManager, data);
	}

	/**
	 * Do a backup
	 * @since 3.0.0
	 * @param {string} providerName The name of the provider
	 * @param {string} table The name of the table
	 * @returns {Promise<string>}
	 */
	async backup(providerName, table) {
		const data = await this.client.providers.get(providerName).getAll(table);
		const path = join(this.dirManager, `${this.timestamp.display()}-${table}.json`);
		await outputJSONAtomic(path, data);
		return path;
	}

	/**
	 * Upload all the backup data to the database
	 * @since 3.0.0
	 * @param {string} providerName The name of the provider
	 * @param {string} table The name of the table
	 * @param {string} time The time of the backup
	 * @returns {Promise<Array<*>>}
	 */
	async upload(providerName, table, time) {
		const data = await readJSON(join(this.dirManager, `${time}-${table}.json`));
		const provider = this.client.providers.get(providerName);
		return Promise.all(data.map(value => provider.create(table, value.id, value)));
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	async init() {
		const { tasks } = this.client.schedule;
		if (!tasks.some(task => task.taskName === this.name)) {
			await this.client.schedule.create(this.name, '0 0 * * mon,thu');
		}
		const fileExists = await exists(this.fileManager);
		if (!fileExists) {
			await outputJSONAtomic(this.fileManager, {
				backups: [],
				lastUpdated: null
			});
		}
	}

};
