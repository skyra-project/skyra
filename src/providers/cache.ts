import { Provider } from 'klasa';
import { mergeObjects } from '@klasa/utils';
import { ENABLE_POSTGRES } from '@root/config';

const enum ErrorMessages {
	TableExists = 'Table Exists',
	TableNotExists = 'Table Not Exists',
	EntryExists = 'Entry Exists',
	EntryNotExists = 'Entry Not Exists'
}

export default class extends Provider {

	private tables = new Map<string, Map<string, object>>();

	public init() {
		if (ENABLE_POSTGRES) this.unload();
		return Promise.resolve();
	}

	public createTable(table: string) {
		if (this.tables.has(table)) return Promise.reject(new Error(ErrorMessages.TableExists));
		this.tables.set(table, new Map());
		return Promise.resolve();
	}

	public deleteTable(table: string) {
		if (!this.tables.has(table)) return Promise.reject(new Error(ErrorMessages.TableNotExists));
		this.tables.delete(table);
		return Promise.resolve();
	}

	public hasTable(table: string) {
		return Promise.resolve(this.tables.has(table));
	}

	public create(table: string, entry: string, data: object) {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (resolvedTable.has(entry)) return Promise.reject(new Error(ErrorMessages.EntryExists));
		const resolved = this.parseUpdateInput(data);
		resolvedTable.set(entry, { ...resolved, id: entry });
		return Promise.resolve();
	}

	public delete(table: string, entry: string) {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (!resolvedTable.has(entry)) return Promise.reject(new Error(ErrorMessages.EntryNotExists));
		resolvedTable.delete(entry);
		return Promise.resolve();
	}

	public get(table: string, entry: string) {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		return Promise.resolve(resolvedTable.get(entry) ?? null);
	}

	public getAll(table: string, entries?: readonly string[]) {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));
		if (typeof entries === 'undefined' || !entries.length) {
			return Promise.resolve([...resolvedTable.values()]);
		}

		const values: object[] = [];
		for (const [key, value] of resolvedTable.entries()) {
			if (entries.includes(key)) values.push(value);
		}

		return Promise.resolve(values);
	}

	public getKeys(table: string) {
		const resolvedTable = this.tables.get(table);
		return typeof resolvedTable === 'undefined'
			? Promise.reject(new Error(ErrorMessages.TableNotExists))
			: Promise.resolve([...resolvedTable.keys()]);
	}

	public has(table: string, entry: string) {
		const resolvedTable = this.tables.get(table);
		return typeof resolvedTable === 'undefined'
			? Promise.reject(new Error(ErrorMessages.TableNotExists))
			: Promise.resolve(resolvedTable.has(entry));
	}

	public update(table: string, entry: string, data: object) {
		const resolvedTable = this.tables.get(table);
		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));

		const resolvedEntry = resolvedTable.get(entry);
		if (typeof resolvedEntry === 'undefined') return Promise.reject(new Error(ErrorMessages.EntryNotExists));

		const resolved = this.parseUpdateInput(data) as Record<PropertyKey, unknown>;
		const merged = mergeObjects({ ...resolvedEntry }, resolved);
		resolvedTable.set(entry, merged);

		return Promise.resolve();
	}

	public replace(table: string, entry: string, data: object) {
		const resolvedTable = this.tables.get(table);

		if (typeof resolvedTable === 'undefined') return Promise.reject(new Error(ErrorMessages.TableNotExists));

		const resolved = this.parseUpdateInput(data);
		resolvedTable.set(entry, { ...resolved, id: entry });
		return Promise.resolve();
	}

}
