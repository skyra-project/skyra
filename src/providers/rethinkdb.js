const { Provider, util: { mergeDefault, chunk } } = require('klasa');
const { r } = require('rethinkdb-ts'); // eslint-disable-line id-length

module.exports = class extends Provider {

	constructor(client, store, file, directory) {
		super(client, store, file, directory);
		this.db = r;
		this.pool = null;
	}

	async init() {
		this.pool = await r.connectPool(mergeDefault({
			db: 'test',
			silent: false
		}, this.client.options.providers.rebirthdb));
	}

	get exec() {
		return this.db;
	}

	async ping() {
		const now = Date.now();
		return (await this.db.now().run()).getTime() - now;
	}

	shutdown() {
		return this.pool.drain();
	}

	/* Table methods */

	hasTable(table) {
		return this.db.tableList().contains(table).run();
	}

	createTable(table) {
		return this.db.tableCreate(table).run();
	}

	deleteTable(table) {
		return this.db.tableDrop(table).run();
	}

	sync(table) {
		return this.db.table(table).sync().run();
	}

	/* Document methods */

	async getAll(table, entries = []) {
		if (entries.length) {
			const chunks = chunk(entries, 50000);
			const output = [];
			// @ts-ignore
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk).run());
			return output;
		}
		return this.db.table(table).run();
	}

	async getKeys(table, entries = []) {
		if (entries.length) {
			const chunks = chunk(entries, 50000);
			const output = [];
			// @ts-ignore
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk)('id').run());
			return output;
		}
		return this.db.table(table)('id').run();
	}

	get(table, id) {
		return this.db.table(table).get(id).run();
	}

	has(table, id) {
		return this.db.table(table).get(id).ne(null).run();
	}

	getRandom(table) {
		return this.db.table(table).sample(1).run();
	}

	create(table, id, value = {}) {
		return this.db.table(table).insert({ ...this.parseUpdateInput(value), id }).run();
	}

	update(table, id, value = {}) {
		return this.db.table(table).get(id).update(this.parseUpdateInput(value)).run();
	}

	replace(table, id, value = {}) {
		return this.db.table(table).get(id).replace({ ...this.parseUpdateInput(value), id }).run();
	}

	delete(table, id) {
		return this.db.table(table).get(id).delete().run();
	}

};
