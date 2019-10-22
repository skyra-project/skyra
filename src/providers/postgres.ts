// Copyright (c) 2017-2018 dirigeants. All rights reserved. MIT license.
import { QueryBuilder } from '@klasa/querybuilder';
import { SQLProvider, SchemaEntry, SchemaFolder, Type, SettingsFolderUpdateResult } from 'klasa';
import { Pool, Submittable, QueryResultRow, QueryArrayConfig, QueryConfig, QueryArrayResult, QueryResult, PoolConfig } from 'pg';
import { isNumber, mergeDefault } from '@klasa/utils';
import { DEV_PGSQL } from '../../config';
import { run as databaseInitRun } from '../lib/util/DatabaseInit';

export default class extends SQLProvider {

	// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
	// @ts-ignore 2416
	public qb = new QueryBuilder({
		array: type => `${type}[]`,
		arraySerializer: (values, piece, resolver) =>
			values.length ? `array[${values.map(value => resolver(value, piece)).join(', ')}]` : "'{}'",
		formatDatatype: (name, datatype, def = null) => `"${name}" ${datatype}${def === null ? '' : ` NOT NULL DEFAULT ${def}`}`
	})
		.add('boolean', { type: 'BOOL' })
		.add('integer', { type: ({ max }) => max !== null && max >= 2 ** 32 ? 'BIGINT' : 'INTEGER' })
		.add('float', { type: 'DOUBLE PRECISION' })
		.add('uuid', { type: 'UUID' })
		.add('any', { type: 'JSON', serializer: input => `'${JSON.stringify(input)}'::json` })
		.add('json', { 'extends': 'any' })
		.add('permissionnode', { 'extends': 'any' });

	public pgsql: Pool | null = null;

	public async init() {
		if (!DEV_PGSQL) return this.unload();

		const poolOptions = mergeDefault<PoolConfig, PoolConfig>({
			host: 'localhost',
			port: 5432,
			database: 'klasa',
			max: 20,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000
		}, this.client.options.providers.postgres);

		this.pgsql = new Pool(poolOptions);
		this.pgsql.on('error', err => this.client.emit('error', err));
		await databaseInitRun(this);
	}

	public async shutdown() {
		if (this.pgsql) await this.pgsql.end();
	}

	/* Table methods */

	public async hasTable(table: string) {
		try {
			const result = await this.runAll(`SELECT true FROM pg_tables WHERE tablename = '${table}';`);
			return result.length !== 0 && result[0].bool === true;
		} catch (e) {
			return false;
		}
	}

	public createTable(table: string, rows?: readonly any[]) {
		if (rows) return this.run(`CREATE TABLE ${sanitizeKeyName(table)} (${rows.map(([k, v]) => `${sanitizeKeyName(k)} ${v}`).join(', ')});`);
		const gateway = this.client.gateways.get(table);
		if (!gateway) throw new Error(`There is no gateway defined with the name ${table} nor an array of rows with datatypes have been given. Expected any of either.`);

		const schemaValues = [...gateway.schema.values(true)];
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2339
		const idLength = gateway.idLength || 18;
		return this.run(`
			CREATE TABLE ${sanitizeKeyName(table)} (
				${[`id VARCHAR(${idLength}) PRIMARY KEY NOT NULL UNIQUE`, ...schemaValues.map(this.qb.generateDatatype.bind(this.qb))].join(', ')}
			)`);
	}

	public deleteTable(table: string) {
		return this.run(`DROP TABLE IF EXISTS ${sanitizeKeyName(table)};`);
	}

	public async countRows(table: string) {
		const result = await this.runOne(`SELECT COUNT(*) FROM ${sanitizeKeyName(table)};`);
		return Number(result.count);
	}

	/* Row methods */

	public async getAll(table: string, entries: readonly string[] = []): Promise<unknown[]> {
		if (entries.length) {
			const results = await this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} WHERE id IN ('${entries.join("', '")}');`);
			return results.map(output => this.parseEntry(table, output));
		}
		const results = await this.runAll(`SELECT * FROM ${sanitizeKeyName(table)};`);
		return results.map(output => this.parseEntry(table, output));
	}

	public async getKeys(table: string): Promise<string[]> {
		const rows = await this.runAll(`SELECT id FROM ${sanitizeKeyName(table)};`);
		return rows.map(row => row.id);
	}

	public async get(table: string, key: string, value?: unknown): Promise<unknown> {
		// If a key is given (id), swap it and search by id - value
		if (typeof value === 'undefined') {
			value = key;
			key = 'id';
		}
		const output = await this.runOne(`SELECT * FROM ${sanitizeKeyName(table)} WHERE ${sanitizeKeyName(key)} = $1 LIMIT 1;`, [value]);
		return this.parseEntry(table, output);
	}

	public async has(table: string, id: string): Promise<boolean> {
		const result = await this.runOne(`SELECT id FROM ${sanitizeKeyName(table)} WHERE id = $1 LIMIT 1;`, [id]);
		return Boolean(result);
	}

	public async getRandom(table: string): Promise<unknown[]> {
		return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY RANDOM() LIMIT 1;`);
	}

	public getSorted(table: string, key: string, order: 'ASC' | 'DESC' = 'DESC', limitMin?: number, limitMax?: number) {
		return this.runAll(`SELECT * FROM ${sanitizeKeyName(table)} ORDER BY ${sanitizeKeyName(key)} ${order} ${parseRange(limitMin, limitMax)};`);
	}

	public create(table: string, id: string, data: CreateOrUpdateValue) {
		const [keys, values] = this.parseUpdateInput(data, false);

		// Push the id to the inserts.
		if (!keys.includes('id')) {
			keys.push('id');
			values.push(id);
		}
		return this.pgsql!.query(`
			INSERT INTO ${sanitizeKeyName(table)} (${keys.map(sanitizeKeyName).join(', ')})
			VALUES (${Array.from({ length: keys.length }, (__, i) => `$${i + 1}`).join(', ')});`, values);
	}

	public update(table: string, id: string, data: CreateOrUpdateValue) {
		const [keys, values] = this.parseUpdateInput(data, false);
		return this.pgsql!.query(`
			UPDATE ${sanitizeKeyName(table)}
			SET ${keys.map((key, i: number) => `${sanitizeKeyName(key)} = $${i + 1}`)}
			WHERE id = '${id.replace(/'/g, "''")}';`, values);
	}

	public replace(table: string, id: string, data: CreateOrUpdateValue) {
		return this.update(table, id, data);
	}

	public incrementValue(table: string, id: string, key: string, amount = 1) {
		return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = $2 + $3 WHERE id = $1;`, [id, key, amount]);
	}

	public decrementValue(table: string, id: string, key: string, amount = 1) {
		return this.run(`UPDATE ${sanitizeKeyName(table)} SET $2 = GREATEST(0, $2 - $3) WHERE id = $1;`, [id, key, amount]);
	}

	public delete(table: string, id: string) {
		return this.run(`DELETE FROM ${sanitizeKeyName(table)} WHERE id = $1;`, [id]);
	}

	public addColumn(table: string, column: SchemaFolder | SchemaEntry) {
		return this.run(column instanceof SchemaFolder
			? `ALTER TABLE ${sanitizeKeyName(table)} ${[...column.values(true)].map(subpiece => `ADD COLUMN ${this.qb.generateDatatype(subpiece)}`).join(', ')};`
			: `ALTER TABLE ${sanitizeKeyName(table)} ADD COLUMN ${this.qb.generateDatatype(column)};`);
	}

	public removeColumn(table: string, columns: string | string[]) {
		if (typeof columns === 'string') return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${sanitizeKeyName(columns)};`);
		if (Array.isArray(columns)) return this.run(`ALTER TABLE ${sanitizeKeyName(table)} DROP COLUMN ${columns.map(sanitizeKeyName).join(', ')};`);
		throw new TypeError('Invalid usage of PostgreSQL#removeColumn. Expected a string or string[].');
	}

	public updateColumn(table: string, entry: SchemaEntry) {
		const [column, datatype] = this.qb.generateDatatype(entry).split(' ');
		return this.pgsql!.query(`ALTER TABLE ${sanitizeKeyName(table)} ALTER COLUMN ${column} TYPE ${datatype}${entry.default
			? `, ALTER COLUMN ${column} SET NOT NULL, ALTER COLUMN ${column} SET DEFAULT ${this.qb.serialize(entry.default, entry)}`
			: ''
		};`);
	}

	public async getColumns(table: string, schema = 'public') {
		const result = await this.runAll(`
			SELECT column_name
			FROM information_schema.columns
			WHERE table_schema = $1
				AND table_name = $2;
		`, [schema, table]);
		return result.map(row => row.column_name);
	}

	public run<T extends Submittable>(queryStream: T): T;
	public run<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>>;
	public run<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>>;
	public run<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>>;
	public run(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		return this.pgsql!.query(...sql);
	}

	public async runAll<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>['rows']>;
	public async runAll<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>['rows']>;
	public async runAll<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>['rows']>;
	public async runAll(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		const results = await this.run(...sql);
		return results.rows;
	}

	public async runOne<R extends unknown[] = unknown[], I extends unknown[] = unknown[]>(queryConfig: QueryArrayConfig<I>, values?: I): Promise<QueryArrayResult<R>['rows'][number]>;
	public async runOne<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryConfig: QueryConfig<I>): Promise<QueryResult<R>['rows'][number]>;
	public async runOne<R extends QueryResultRow = any, I extends unknown[] = unknown[]>(queryTextOrConfig: string | QueryConfig<I>, values?: I): Promise<QueryResult<R>['rows'][number]>;
	public async runOne(...sql: readonly unknown[]) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
		// @ts-ignore 2556
		const results = await this.run(...sql);
		return results.rows[0] || null;
	}

}

/**
 * @param value The string to sanitize as a key
 */
function sanitizeKeyName(value: string) {
	if (typeof value !== 'string') throw new TypeError(`[SANITIZE_NAME] Expected a string, got: ${new Type(value)}`);
	if (/`|"/.test(value)) throw new TypeError(`Invalid input (${value}).`);
	if (value.startsWith('"') && value.endsWith('"')) return value;
	return `"${value}"`;
}

/**
 * @param min The minimum value
 * @param max The maximum value
 */
function parseRange(min?: number, max?: number) {
	// Min value validation
	if (typeof min === 'undefined') return '';
	if (!isNumber(min)) {
		throw new TypeError(`[PARSE_RANGE] 'min' parameter expects an integer or undefined, got ${min}`);
	}
	if (min < 0) {
		throw new RangeError(`[PARSE_RANGE] 'min' parameter expects to be equal or greater than zero, got ${min}`);
	}

	// Max value validation
	if (typeof max !== 'undefined') {
		if (!isNumber(max)) {
			throw new TypeError(`[PARSE_RANGE] 'max' parameter expects an integer or undefined, got ${max}`);
		}
		if (max <= min) {
			throw new RangeError(`[PARSE_RANGE] 'max' parameter expects ${max} to be greater than ${min}. Got: ${max} <= ${min}`);
		}
	}

	return `LIMIT ${min}${typeof max === 'number' ? `,${max}` : ''}`;
}

type CreateOrUpdateValue = SettingsFolderUpdateResult[] | [string, unknown][] | Record<string, unknown>;
