const { Task, Timestamp } = require('klasa');
const { outputJSONAtomic, readJSON, remove, pathExists } = require('fs-nextra');
const { join } = require('path');

module.exports = class extends Task {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory);
		this.timestamp = new Timestamp('YYYY-MM-DD x');
	}

	public get dirManager() {
		return join(this.client.userBaseDirectory, 'bwd', 'backups');
	}

	public get fileManager() {
		return join(this.dirManager, 'backups.json');
	}

	public async run() {
		this.disable();
		const r = this.client.providers.default.db;
		const tables = await r.tableList().run();
		const paths = await Promise.all(tables.map((table) => r.table(table).run().then((entries) => this.backup(table, entries))));
		await this.writeFile(paths);
		this.enable();
	}

	// Remove old backups to save space
	public async writeFile(paths) {
		const data = await readJSON(this.fileManager);

		// Update the timestamp to latest
		data.lastUpdated = Date.now();
		data.backups.push(paths);
		if (data.backups.length > 4) {
			const [oldPaths] = data.backups.splice(0, 1);
			await Promise.all(oldPaths.map(remove));
		}

		await outputJSONAtomic(this.fileManager, data);
	}

	/**
	 * Do a backup
	 * @since 3.0.0
	 * @param {string} table The name of the table
	 * @param {Object<string, *>[]} entries The entries
	 * @returns {Promise<string>}
	 */
	public async backup(table, entries) {
		const path = join(this.dirManager, `${this.timestamp.display()}-${table}.json`);
		await outputJSONAtomic(path, entries);
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
	public async upload(providerName, table, time) {
		const data = await readJSON(join(this.dirManager, `${time}-${table}.json`));
		const provider = this.client.providers.get(providerName);
		return Promise.all(data.map((value) => provider.create(table, value.id, value)));
	}

	// If this task is not being run, let's create the
	// ScheduledTask and make it run every 10 minutes.
	public async init() {
		const fileExists = await pathExists(this.fileManager);
		if (!fileExists) {
			await outputJSONAtomic(this.fileManager, {
				backups: [],
				lastUpdated: null
			});
		}
	}

};
