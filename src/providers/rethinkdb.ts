import { Provider, util } from 'klasa';
import { MasterPool, r, R, TableChangeResult, WriteResult } from 'rethinkdb-ts';

export default class RethinkDB extends Provider {

	public db: R;
	public pool: MasterPool;

	public async init(): Promise<void> {
		const options = util.mergeDefault({
			db: 'test',
			silent: false
		}, this.client.options.providers.rethinkdb);
		this.pool = await r.connectPool(options);
		await this.db.branch(this.db.dbList().contains(options.db), null, this.db.dbCreate(options.db)).run();
		// await DatabaseInit.init(this.db);
	}

	public async ping(): Promise<number> {
		const now = Date.now();
		return (await this.db.now().run()).getTime() - now;
	}

	public shutdown(): Promise<void> {
		return this.pool.drain();
	}

	/* Table methods */

	public hasTable(table: string): Promise<boolean> {
		return this.db.tableList().contains(table).run();
	}

	public createTable(table: string): Promise<TableChangeResult> {
		return this.db.tableCreate(table).run();
	}

	public deleteTable(table: string): Promise<TableChangeResult> {
		return this.db.tableDrop(table).run();
	}

	public sync(table: string): Promise<{ synced: number }> {
		return this.db.table(table).sync().run();
	}

	/* Document methods */

	public async getAll(table: string, entries: string[] = []): Promise<any[]> {
		if (entries.length) {
			const chunks = util.chunk(entries, 50000);
			const output = [];
			// @ts-ignore
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk).run());
			return output;
		}
		return this.db.table(table).run();
	}

	public async getKeys(table: string, entries: string[] = []): Promise<string[]> {
		if (entries.length) {
			const chunks = util.chunk(entries, 50000);
			const output = [];
			// @ts-ignore
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk)('id').run());
			return output;
		}
		return this.db.table(table)('id').run();
	}

	public get(table: string, id: string): Promise<any> {
		return this.db.table(table).get(id).run();
	}

	public has(table: string, id: string): Promise<boolean> {
		return this.db.table(table).get(id).ne(null).run();
	}

	public getRandom(table: string): Promise<any> {
		return this.db.table(table).sample(1).run();
	}

	public create(table: string, id: string, value: object = {}): Promise<WriteResult> {
		return this.db.table(table).insert({ ...this.parseUpdateInput(value), id }).run();
	}

	public update(table: string, id: string, value: object = {}): Promise<WriteResult> {
		return this.db.table(table).get(id).update(this.parseUpdateInput(value)).run();
	}

	public replace(table: string, id: string, value: object = {}): Promise<WriteResult> {
		return this.db.table(table).get(id).replace({ ...this.parseUpdateInput(value), id }).run();
	}

	public delete(table: string, id: string): Promise<WriteResult> {
		return this.db.table(table).get(id).delete().run();
	}

}
