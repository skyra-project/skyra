const { Task, Timestamp } = require('klasa');
const { outputJSONAtomic, readJSON } = require('fs-nextra');
const { join } = require('path');

module.exports = class extends Task {

	constructor(...args) {
		super(...args);
		this.timestamp = new Timestamp('YYYY-MM-DD');
	}

	async run() {
		await Promise.all([
			this.backup('json', 'clientStorage'),
			this.backup('postgresql', 'localScores'),
			this.backup('postgresql', 'users'),
			this.backup('rethinkdb', 'guilds')
		]);
	}

	/**
	 * Do a backup
	 * @since 3.0.0
	 * @param {string} providerName The name of the provider
	 * @param {string} table The name of the table
	 * @returns {Promise<void>}
	 */
	async backup(providerName, table) {
		const data = await this.client.providers.get(providerName).getAll(table);
		return outputJSONAtomic(join(this.client.clientBaseDir, `${this.timestamp.display()}-${table}.json`), data);
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
		const data = await readJSON(join(this.client.clientBaseDir, `${time}-${table}.json`));
		const provider = this.client.providers.get(providerName);
		return Promise.all(data.map(value => provider.create(table, value.id, value)));
	}

	/**
	 * Init the crono. Execute this only once
	 * @since 3.0.0
	 * @returns {Promise<*>}
	 */
	_initCron() {
		return this.client.schedule.create('backup', '0 0 * * mon');
	}

};
