import { Provider, ProviderStore } from 'klasa';
import { mergeDefault, mergeObjects, chunk } from '@klasa/utils';
import { resolve } from 'path';
import { ensureDir, pathExists, mkdir, unlink, outputJSONAtomic, readdir, readJSON, emptyDir, remove } from 'fs-nextra';
import { rootFolder } from '../lib/util/constants';

export default class extends Provider {

	private readonly baseDirectory: string;

	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);

		const baseDirectory = resolve(rootFolder, 'bwd', 'provider', 'json');
		const defaults = mergeDefault({ baseDirectory }, this.client.options.providers.json);
		this.baseDirectory = defaults.baseDirectory;
	}

	/**
	 * Initializes the database
	 * @private
	 */
	public async init() {
		await ensureDir(this.baseDirectory).catch(err => this.client.emit('error', err));
	}

	/* Table methods */

	/**
	 * Checks if a directory exists.
	 * @param table The name of the table you want to check
	 */
	public hasTable(table: string) {
		return pathExists(resolve(this.baseDirectory, table));
	}

	/**
	 * Creates a new directory.
	 * @param table The name for the new directory
	 */
	public createTable(table: string) {
		return mkdir(resolve(this.baseDirectory, table));
	}

	/**
	 * Recursively deletes a directory.
	 * @param {string} table The directory's name to delete
	 */
	public async deleteTable(table: string) {
		const exists = await this.hasTable(table);
		return exists ? emptyDir(resolve(this.baseDirectory, table)).then(() => remove(resolve(this.baseDirectory, table))) : null;
	}

	/* Document methods */

	/**
	 * Get all documents from a directory.
	 * @param table The name of the directory to fetch from
	 * @param entries The entries to download, defaults to all keys in the directory
	 */
	public async getAll(table: string, entries?: string[]) {
		if (!Array.isArray(entries) || !entries.length) entries = await this.getKeys(table);
		if (entries.length < 5000) {
			return Promise.all(entries.map(this.get.bind(this, table)));
		}

		const chunks = chunk(entries, 5000);
		const output: unknown[] = [];
		for (const chunk of chunks) output.push(...await Promise.all(chunk.map(this.get.bind(this, table))));
		return output;
	}

	/**
	 * Get all document names from a directory, filter by json.
	 * @param table The name of the directory to fetch from
	 */
	public async getKeys(table: string) {
		const dir = resolve(this.baseDirectory, table);
		const filenames = await readdir(dir);
		const files = [];
		for (const filename of filenames) {
			if (filename.endsWith('.json')) files.push(filename.slice(0, filename.length - 5));
		}
		return files;
	}

	/**
	 * Get a document from a directory.
	 * @param table The name of the directory
	 * @param id The document name
	 */
	public async get(table: string, id: string) {
		try {
			return readJSON(this.getFilename(table, id));
		} catch (e) {
			return null;
		}
	}

	/**
	 * Check if the document exists.
	 * @param table The name of the directory
	 * @param id The document name
	 */
	public has(table: string, id: string) {
		return pathExists(this.getFilename(table, id));
	}

	/**
	 * Get a random document from a directory.
	 * @param table The name of the directory
	 */
	public async getRandom(table: string) {
		const data = await this.getKeys(table);
		return this.get(table, data[Math.floor(Math.random() * data.length)]);
	}

	/**
	 * Insert a new document into a directory.
	 * @param table The name of the directory
	 * @param id The document name
	 * @param data The object with all properties you want to insert into the document
	 */
	public create(table: string, id: string, data: object = {}) {
		return outputJSONAtomic(this.getFilename(table, id), { id, ...this.parseUpdateInput(data) });
	}

	/**
	 * Update a document from a directory.
	 * @param table The name of the directory
	 * @param id The document name
	 * @param data The object with all the properties you want to update
	 */
	public async update(table: string, id: string, data: object) {
		const existent = await this.get(table, id);
		const parsedData = this.parseUpdateInput(data) as Record<PropertyKey, unknown>;
		return outputJSONAtomic(this.getFilename(table, id), mergeObjects(existent || { id }, parsedData));
	}

	/**
	 * Replace all the data from a document.
	 * @param {string} table The name of the directory
	 * @param {string} id The document name
	 * @param {Object} data The new data for the document
	 */
	public replace(table: string, id: string, data: object) {
		return outputJSONAtomic(this.getFilename(table, id), { id, ...this.parseUpdateInput(data) });
	}

	/**
	 * Delete a document from the table.
	 * @param table The name of the directory
	 * @param id The document name
	 */
	public delete(table: string, id: string) {
		return unlink(this.getFilename(table, id));
	}

	private getFilename(table: string, id: string) {
		return resolve(this.baseDirectory, table, `${id}.json`);
	}

}
