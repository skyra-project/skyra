import { Provider, util } from 'klasa';
import { MasterPool, r, R, TableChangeResult, WriteResult } from 'rethinkdb-ts';
const { mergeDefault, chunk } = util;

export default class extends Provider {

	public db: R = r;
	public pool: MasterPool | null = null;

	public create(table: string, id: string, value: { [k: string]: any } = {}): Promise<WriteResult> {
		return this.db.table(table).insert({ ...this.parseUpdateInput(value), id }).run();
	}

	public createTable(table: string): Promise<TableChangeResult> {
		return this.db.tableCreate(table).run();
	}

	public delete(table: string, id: string): Promise<WriteResult> {
		return this.db.table(table).get(id).delete().run();
	}

	public deleteTable(table: string): Promise<TableChangeResult> {
		return this.db.tableDrop(table).run();
	}

	public get<T extends object>(table: string, id: string): Promise<T> {
		return this.db.table(table).get(id).run();
	}

	/* Document methods */

	public async getAll<T extends object>(table: string, entries: Array<string> = []): Promise<Array<T>> {
		if (entries.length) {
			const chunks: Array<Array<string>> = chunk(entries, 50000);
			const output: Array<T> = [];
			// @ts-ignore
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk).run());
			return output;
		}
		return this.db.table(table).run();
	}

	public async getKeys(table: string, entries: Array<string> = []): Promise<Array<string>> {
		if (entries.length) {
			const chunks: Array<Array<string>> = chunk(entries, 50000);
			const output: Array<string> = [];
			// @ts-ignore
			for (const myChunk of chunks) output.push(...await this.db.table(table).getAll(...myChunk)('id').run());
			return output;
		}
		return this.db.table(table)('id').run();
	}

	public getRandom<T extends object>(table: string): Promise<T> {
		return this.db.table(table).sample(1).nth(0).default(null).run();
	}

	public has(table: string, id: string): Promise<boolean> {
		return this.db.table(table).get(id).ne(null).run();
	}

	/* Table methods */

	public hasTable(table: string): Promise<boolean> {
		return this.db.tableList().contains(table).run();
	}

	public async init(): Promise<void> {
		this.pool = await r.connectPool(mergeDefault({
			db: 'test',
			silent: false
			// @ts-ignore
		}, this.client.options.providers.rebirthdb));
	}

	public async ping(): Promise<number> {
		const now: number = Date.now();
		return (await this.db.now().run()).getTime() - now;
	}

	public replace(table: string, id: string, value: { [k: string]: any } = {}): Promise<WriteResult> {
		return this.db.table(table).get(id).replace({ ...this.parseUpdateInput(value), id }).run();
	}

	public sync(table: string): Promise<{ synced: number }> {
		return this.db.table(table).sync().run();
	}

	public update(table: string, id: string, value: { [k: string]: any } = {}): Promise<WriteResult> {
		return this.db.table(table).get(id).update(this.parseUpdateInput(value)).run();
	}

}
