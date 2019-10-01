import { Provider, util } from 'klasa';
import { MasterPool, r } from 'rethinkdb-ts';

export default class extends Provider {

	public db = r;
	public pool: MasterPool | null = null;

	public async init() {
		const options = util.mergeDefault({
			db: 'test',
			silent: false
		}, this.client.options.providers.rethinkdb);
		this.pool = await r.connectPool(options);
		await this.db.branch(this.db.dbList().contains(options.db), null, this.db.dbCreate(options.db)).run();
	}

	public async ping() {
		const now = Date.now();
		return (await this.db.now().run()).getTime() - now;
	}

	public shutdown() {
		return this.pool!.drain();
	}

	/* Table methods */

	public hasTable(table: string) {
		return this.db.tableList().contains(table).run();
	}

	public createTable(table: string) {
		return this.db.tableCreate(table).run();
	}

	public deleteTable(table: string) {
		return this.db.tableDrop(table).run();
	}

	public sync(table: string) {
		return this.db.table(table).sync().run();
	}

	/* Document methods */

	public async getAll(table: string, entries: string[] = []) {
		if (entries.length) {
			const chunks = util.chunk(entries, 50000);
			const output: unknown[] = [];
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk).run());
			return output;
		}
		return await this.db.table(table).run() as unknown[];
	}

	public async getKeys(table: string, entries: string[] = []) {
		if (entries.length) {
			const chunks = util.chunk(entries, 50000);
			const output: string[] = [];
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk)('id').run());
			return output;
		}
		return await this.db.table(table)('id').run() as string[];
	}

	public get(table: string, id: string) {
		return this.db.table(table).get(id).run();
	}

	public has(table: string, id: string) {
		return this.db.table(table).get(id).ne(null)
			.run();
	}

	public getRandom(table: string) {
		return this.db.table(table).sample(1).run();
	}

	public create(table: string, id: string, value: object = {}) {
		return this.db.table(table).insert({ ...this.parseUpdateInput(value), id }).run();
	}

	public update(table: string, id: string, value: object = {}) {
		return this.db.table(table).get(id).update(this.parseUpdateInput(value))
			.run();
	}

	public replace(table: string, id: string, value: object = {}) {
		return this.db.table(table).get(id).replace({ ...this.parseUpdateInput(value), id })
			.run();
	}

	public delete(table: string, id: string) {
		return this.db.table(table).get(id).delete()
			.run();
	}

}
