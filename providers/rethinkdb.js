const { Provider, databaseInit } = require('../index');
const rethink = require('rethinkdbdash');

module.exports = class extends Provider {

	constructor(...args) {
		super(...args);
		this.db = rethink(this.client.options.providers.rethinkdb);
	}

	async init() {
		// Init all databases
		await databaseInit.init(this.db);
	}

	/* Table methods */

	get exec() {
		return this.db;
	}

	/**
	 * Checks if the table exists.
	 * @param {string} table the name of the table you want to check.
	 * @returns {Promise<boolean>}
	 */
	hasTable(table) {
		return this.db.tableList().then(data => data.includes(table));
	}

	/**
	 * Creates a new table.
	 * @param {string} table the name for the new table.
	 * @returns {Promise<Object>}
	 */
	createTable(table) {
		return this.db.tableCreate(table).then(resolvePromise);
	}

	/**
	 * Deletes a table.
	 * @param {string} table the name of the table you want to drop.
	 * @returns {Promise<Object>}
	 */
	deleteTable(table) {
		return this.db.tableDrop(table).then(resolvePromise);
	}

	/**
	 * Sync the database.
	 * @param {string} table the name of the table you want to sync.
	 * @returns {Promise<Object>}
	 */
	sync(table) {
		return this.db.table(table).sync().then(resolvePromise);
	}

	/* Document methods */

	/**
	 * Get all entries from a table.
	 * @param {string} table The name of the table you want to get the data from.
	 * @returns {Promise<Object[]>}
	 */
	getAll(table) {
		return this.db.table(table).then(resolvePromise);
	}

	/**
	 *
	 * @param {string} table The name of the table you want to get the data from.
	 * @returns {Promise<string[]>}
	 */
	getKeys(table) {
		return this.db.table(table)('id').then(resolvePromise);
	}

	/**
	 * Get an entry from a table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @returns {Promise<Object>}
	 */
	get(table, id) {
		return this.db.table(table).get(id).then(resolvePromise);
	}

	/**
	 * Check if an entry exists from a table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @returns {Promise<boolean>}
	 */
	has(table, id) {
		return this.get(table, id).then(data => !!data).catch(() => false);
	}

	/**
	 * Get a random entry from a table.
	 * @param {string} table the name of the table.
	 * @returns {Promise<Object>}
	 */
	getRandom(table) {
		return this.all(table).then(data => data[Math.floor(Math.random() * data.length)]);
	}

	/**
	 * Update or insert a new value to all entries.
	 * @param {string} table The name of the table.
	 * @param {string} path The object to remove or a path to update.
	 * @param {*} newValue The new value for the key.
	 * @returns {Promise<Object>}
	 * @example
	 * // Editing a single value
	 * // You can edit a single value in a very similar way to Gateway#updateOne.
	 * updateValue('339942739275677727', 'channels.modlogs', '340713281972862976');
	 *
	 * // However, you can also update it by passing an object.
	 * updateValue('339942739275677727', { channels: { modlogs: '340713281972862976' } });
	 *
	 * // Editing multiple values
	 * // As RethinkDB#updateValue can also work very similar to Gateway#updateMany, it also accepts an entire object with multiple values.
	 * updateValue('339942739275677727', { prefix: 'k!', roles: { administrator: '339959033937264641' } });
	 */
	async updateValue(table, path, newValue) {
		// { channels: { modlog: '340713281972862976' } } | undefined
		if (typeof path === 'object' && typeof newValue === 'undefined') {
			return this.db.table(table).update(path).then(resolvePromise);
		}
		// 'channels.modlog' | '340713281972862976'
		if (typeof path === 'string' && typeof newValue !== 'undefined') {
			const route = path.split('.');
			const object = {};
			let ref = object;
			for (let i = 0; i < route.length - 1; i++) ref = ref[route[i]] = {};
			ref[route[route.length - 1]] = newValue;
			return this.db.table(table).update(object).then(resolvePromise);
		}
		throw new TypeError(`Expected an object as first parameter or a string and a non-undefined value. Got: ${typeof key} and ${typeof value}`);
	}

	/**
	 * Remove a value or object from all entries.
	 * @param {string} table The name of the table.
	 * @param {string} doc The object to remove or a path to update.
	 * @returns {Promise<Object>}
	 */
	async removeValue(table, doc) {
		// { channels: { modlog: true } }
		if (typeof doc === 'object') {
			return this.db.table(table).replace(this.db.row.without(doc)).then(resolvePromise);
		}
		// 'channels.modlog'
		if (typeof doc === 'string') {
			const route = doc.split('.');
			const object = {};
			let ref = object;
			for (let i = 0; i < route.length - 1; i++) ref = ref[route[i]] = {};
			ref[route[route.length - 1]] = true;
			return this.db.table(table).replace(this.db.row.without(object)).then(resolvePromise);
		}
		throw new TypeError(`Expected an object or a string as first parameter. Got: ${typeof doc}`);
	}

	/**
	 * Insert a new document into a table.
	 * @param {string} table the name of the table.
	 * @param {string} id the id of the record.
	 * @param {Object} doc the object you want to insert in the table.
	 * @returns {Promise<Object>}
	 */
	create(table, id, doc = {}) {
		return this.db.table(table).insert(Object.assign(doc, { id })).then(resolvePromise);
	}

	set(...args) {
		return this.create(...args);
	}

	insert(...args) {
		return this.create(...args);
	}

	/**
	 * Update a document from a table given its ID.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {Object} doc the object you want to insert in the table.
	 * @returns {Promise<Object>}
	 */
	update(table, id, doc) {
		return this.db.table(table).get(id).update(doc).then(resolvePromise);
	}

	/**
	 * @param {string} table The name of the table to update the data from
	 * @param {string} id The id of the row to update
	 * @param {string} key The key to update
	 * @param {number} [amount] The value to increase
	 * @returns {Promise<number>}
	 */
	incrementValue(table, id, key, amount) {
		return this.mathValue(table, id, key, 'add', amount);
	}

	/**
	 * @param {string} table The name of the table to update the data from
	 * @param {string} id The id of the row to update
	 * @param {string} key The key to update
	 * @param {number} [amount] The value to decrease
	 * @returns {Promise<number>}
	 */
	decrementValue(table, id, key, amount) {
		return this.mathValue(table, id, key, 'sub', amount);
	}

	/**
	 * @param {string} table The name of the table to update the data from
	 * @param {string} id The id of the row to update
	 * @param {string} key The key to update
	 * @param {'add'|'sub'|'mul'|'div'|'mod'} type The math operation to perform.
	 * @param {number} [amount=1] The value to decrease
	 * @returns {Promise<number>}
	 */
	mathValue(table, id, key, type, amount = 1) {
		if (isNaN(amount) || Number.isInteger(amount) === false || Number.isSafeInteger(amount) === false) {
			throw new TypeError(`RethinkDB#mathValue expects the parameter 'amount' to be an integer greater or equal than zero. Got: ${amount}`);
		}

		const path = key.split('.');
		let upd = this.db.table(table).get(id);
		for (let i = 0; i < path.length; i++) upd = upd(path[i]);

		if (typeof upd[type] === 'function') return upd[type](amount).then(resolvePromise);
		throw new Error(`The type ${type} is not a function. Expected: 'add', 'sub', 'mul', 'div' or 'mod'.`);
	}

	/**
	 * Replace the object from an entry with another.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {Object} doc the document in question to replace the current entry's properties.
	 * @returns {Promise<Object>}
	 */
	replace(table, id, doc) {
		return this.db.table(table).get(id).replace(doc).then(resolvePromise);
	}

	/**
	 * Delete an entry from the table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @returns {Promise<Object>}
	 */
	delete(table, id) {
		return this.db.table(table).get(id).delete().then(resolvePromise);
	}

	/**
	 * Insert an object into an array given the name of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {Object} doc the object you want to insert in the table.
	 * @returns {Promise<Object>}
	 */
	append(table, id, uArray, doc) {
		return this.db.table(table).get(id).update(object => ({ [uArray]: object(uArray).default([]).append(doc) })).then(resolvePromise);
	}

	/**
	 * Update an object into an array given the position of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {number} index the position of the object inside the array.
	 * @param {Object} doc the object you want to insert in the table.
	 * @returns {Promise<Object>}
	 */
	updateArrayByIndex(table, id, uArray, index, doc) {
		return this.db.table(table).get(id).update({ [uArray]: this.db.row(uArray).changeAt(index, this.db.row(uArray).nth(index).merge(doc)) }).then(resolvePromise);
	}

	/**
	 * Update an object into an array given the ID, the name of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {string} index the ID of the object inside the array.
	 * @param {Object} doc the object you want to insert in the table.
	 * @returns {Promise<Object>}
	 */
	updateArrayByID(table, id, uArray, index, doc) {
		return this.db.table(table).get(id).update({ [uArray]: this.db.row(uArray).map(da => this.db.branch(da('id').eq(index), da.merge(doc), da)) }).then(resolvePromise);
	}

	/**
	 * Remove an object from an array given the position of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {number} index the position of the object inside the array.
	 * @returns {Promise<Object>}
	 */
	removeFromArrayByIndex(table, id, uArray, index) {
		return this.db.table(table).get(id).update({ [uArray]: this.db.row(uArray).deleteAt(index) }).then(resolvePromise);
	}

	/**
	 * Remove an object from an array given the position of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {string} index the ID of the object inside the array.
	 * @returns {Promise<Object>}
	 */
	removeFromArrayByID(table, id, uArray, index) {
		return this.db.table(table).get(id).update({ [uArray]: this.db.row(uArray).filter(it => it('id').ne(index)) }).then(resolvePromise);
	}

	/**
	 * Get an object from an array given the position of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {number} index the position of the object inside the array.
	 * @returns {Promise<Object>}
	 */
	getFromArrayByIndex(table, id, uArray, index) {
		return this.db.table(table).get(id)(uArray).nth(index).then(resolvePromise);
	}

	/**
	 * Get an object into an array given the ID, the name of the array, entry ID and table.
	 * @param {string} table the name of the table.
	 * @param {string|number} id the entry's ID.
	 * @param {string} uArray the name of the array you want to update.
	 * @param {string} index the ID of the object inside the array.
	 * @returns {Promise<?Object>}
	 */
	getFromArrayByID(table, id, uArray, index) {
		return this.db.table(table).get(id)(uArray).filter(rethink.row('id').eq(index)).then(res => res.length ? res[0] : null);
	}

};

function resolvePromise(value) {
	return value;
}
