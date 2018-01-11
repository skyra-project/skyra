const { Provider, util } = require('klasa');
const { Pool } = require('pg');

module.exports = class PostgreSQL extends Provider {

	constructor(...args) {
		super(...args, {
			enabled: true,
			sql: true,
			description: 'Allows you to use PostgreSQL functionality throught Klasa'
		});
		this.db = null;
	}

	async init() {
		this.db = new Pool(this.client.options.providers.postgresql);
		this.db.on('error', err => this.client.emit('error', err));
		await this.db.connect();
		await this._createTables();
	}

	async _createTables() {
		await this.run(`
			CREATE TABLE IF NOT EXISTS "localScores" (
				"id" VARCHAR(19) NOT NULL,
				"guild" VARCHAR(19) NOT NULL,
				"count" INTEGER NOT NULL DEFAULT 0,
				PRIMARY KEY (id, guild)
			);
		`);
		await this.run(`
			CREATE TABLE IF NOT EXISTS "users" (
				"id" VARCHAR(19) NOT NULL PRIMARY KEY,
				"points" INTEGER NOT NULL DEFAULT 0,
				"color" VARCHAR(6) NOT NULL DEFAULT 'ff239d',
				"money" INTEGER NOT NULL DEFAULT 0,
				"reputation" SMALLINT NOT NULL DEFAULT 0,
				"themeProfile" VARCHAR(7) NOT NULL DEFAULT '0001',
				"themeLevel" VARCHAR(7) NOT NULL DEFAULT '1001',
				"badgeSet" TEXT NOT NULL DEFAULT '[]',
				"badgeList" TEXT NOT NULL DEFAULT '[]',
				"bannerList" TEXT NOT NULL DEFAULT '[]',
				"timeDaily" BIGINT NOT NULL DEFAULT 0,
				"timeReputation" BIGINT NOT NULL DEFAULT 0
			);
		`);
	}

	shutdown() {
		return this.db.end();
	}

	/* Table methods */

	/**
	 * @param {string} table Check if a table exists
	 * @returns {Promise<boolean>}
	 */
	async hasTable(table) {
		return this.runAll(`SELECT true FROM pg_tables WHERE tablename = '${table}';`)
			.then(result => result.length !== 0 && result[0].bool === true)
			.catch(() => false);
	}

	/**
	 * @param {string} table The name of the table to create
	 * @param {string} rows The rows with their respective datatypes
	 * @returns {Promise<Object[]>}
	 */
	createTable(table, rows) {
		return this.run(`CREATE TABLE "${sanitizeKeyName(table)}" (${rows});`);
	}

	/**
	 * @param {string} table The name of the table to drop
	 * @returns {Promise<Object[]>}
	 */
	deleteTable(table) {
		return this.run(`DROP TABLE IF EXISTS "${sanitizeKeyName(table)}";`);
	}

	/**
	 * @param {string} table The table with the rows to count
	 * @returns {Promise<number>}
	 */
	countRows(table) {
		return this.runOne(`SELECT COUNT(*) FROM "${sanitizeKeyName(table)}";`)
			.then(result => parseInt(result.count));
	}

	/* Row methods */

	/**
	 * @param {string} table The name of the table to get the data from
	 * @param {string} [key] The key to filter the data from. Requires the value parameter
	 * @param {*}    [value] The value to filter the data from. Requires the key parameter
	 * @param {number} [limitMin] The minimum range. Must be higher than zero
	 * @param {number} [limitMax] The maximum range. Must be higher than the limitMin parameter
	 * @returns {Promise<Object[]>}
	 */
	getAll(table, key, value, limitMin, limitMax) {
		if (typeof key !== 'undefined' && typeof value !== 'undefined') {
			return this.runAll(`SELECT * FROM "${sanitizeKeyName(table)}" WHERE "${sanitizeKeyName(key)}" = $1 ${parseRange(limitMin, limitMax)};`, [value]);
		}

		return this.runAll(`SELECT * FROM "${sanitizeKeyName(table)}" ${parseRange(limitMin, limitMax)};`);
	}

	/**
	 * @param {string} table The name of the table to get the data from
	 * @returns {Promise<Object[]>}
	 */
	getKeys(table) {
		return this.runAll(`SELECT id FROM "${sanitizeKeyName(table)}";`)
			.then(rows => rows.map(row => row.id));
	}

	/**
	 * @param {string} table The name of the table to get the data from
	 * @param {string} key The key to filter the data from
	 * @param {*}    [value] The value of the filtered key
	 * @returns {Promise<Object>}
	 */
	get(table, key, value) {
		// If a key is given (id), swap it and search by id - value
		if (typeof value === 'undefined') {
			value = key;
			key = 'id';
		}
		return this.runOne(`SELECT * FROM "${sanitizeKeyName(table)}" WHERE "${sanitizeKeyName(key)}" = $1 LIMIT 1;`, [value]);
	}

	/**
	 * @param {string} table The name of the table to get the data from
	 * @param {string} id    The value of the id
	 * @returns {Promise<boolean>}
	 */
	has(table, id) {
		return this.runOne(`SELECT id FROM "${sanitizeKeyName(table)}" WHERE id = $1 LIMIT 1;`, [id])
			.then(result => Boolean(result));
	}

	/**
	 * @param {string} table The name of the table to get the data from
	 * @returns {Promise<Object>}
	 */
	getRandom(table) {
		return this.runOne(`SELECT * FROM "${sanitizeKeyName(table)}" ORDER BY RANDOM() LIMIT 1;`);
	}

	/**
	 * @param {string} table The name of the table to get the data from
	 * @param {string} key The key to sort by
	 * @param {('ASC'|'DESC')} [order='DESC'] Whether the order should be ascendent or descendent
	 * @param {number} [limitMin] The minimum range
	 * @param {number} [limitMax] The maximum range
	 * @returns {Promise<Object[]>}
	 */
	async getSorted(table, key, order = 'DESC', limitMin, limitMax) {
		if (order !== 'DESC' && order !== 'ASC') {
			throw new TypeError(`PostgreSQL#getSorted 'order' parameter expects either 'DESC' or 'ASC'. Got: ${order}`);
		}

		return this.runAll(`SELECT * FROM "${sanitizeKeyName(table)}" ORDER BY "${sanitizeKeyName(key)}" ${order} ${parseRange(limitMin, limitMax)};`);
	}

	/**
	 * @param {string} table The name of the table to insert the new data
	 * @param {string} id The id of the new row to insert
	 * @param {(string|string[]|{})} param1 The first parameter to validate.
	 * @param {*} [param2] The second parameter to validate.
	 * @returns {Promise<any[]>}
	 */
	insert(table, id, param1, param2) {
		const [keys, values] = acceptArbitraryInput(param1, param2);

		// Push the id to the inserts.
		keys.push('id');
		values.push(id);
		return this.run(`INSERT INTO "${sanitizeKeyName(table)}" (${keys.map(sanitizeKeyName).join(', ')}) VALUES (${makeVariables(keys.length)});`, values);
	}

	/**
	 * @param {...*} args The arguments
	 * @alias PostgreSQL#insert
	 * @returns {Promise<any[]>}
	 */
	create(...args) {
		return this.insert(...args);
	}

	/**
	 * @param {string} table The name of the table to update the data from
	 * @param {string} id The id of the row to update
	 * @param {(string|string[]|{})} param1 The first parameter to validate.
	 * @param {*} [param2] The second parameter to validate.
	 * @returns {Promise<any[]>}
	 */
	update(table, id, param1, param2) {
		const [keys, values] = acceptArbitraryInput(param1, param2);
		return this.run(`UPDATE "${sanitizeKeyName(table)}" SET ${keys.map((key, i) => `"${sanitizeKeyName(key)}" = $${i + 1}`)} WHERE id = ${sanitizeString(id)};`, values);
	}

	/**
	 * @param {...*} args The arguments
	 * @alias PostgreSQL#update
	 * @returns {Promise<any[]>}
	 */
	replace(...args) {
		return this.update(...args);
	}

	/**
	 * @param {string} table The name of the table to update the data from
	 * @param {string} id The id of the row to update
	 * @param {string} key The key to update
	 * @param {number} [amount=1] The value to increase
	 * @returns {Promise<any[]>}
	 */
	incrementValue(table, id, key, amount = 1) {
		if (amount < 0 || isNaN(amount) || Number.isInteger(amount) === false || Number.isSafeInteger(amount) === false) {
			throw new TypeError(`PostgreSQL#incrementValue expects the parameter 'amount' to be an integer greater or equal than zero. Got: ${amount}`);
		}

		return this.run(`UPDATE "${sanitizeKeyName(table)}" SET $2 = $2 + $3 WHERE id = $1;`, [id, key, amount]);
	}

	/**
	 * @param {string} table The name of the table to update the data from
	 * @param {string} id The id of the row to update
	 * @param {string} key The key to update
	 * @param {number} [amount=1] The value to decrease
	 * @returns {Promise<any[]>}
	 */
	decrementValue(table, id, key, amount = 1) {
		if (amount < 0 || isNaN(amount) || Number.isInteger(amount) === false || Number.isSafeInteger(amount) === false) {
			throw new TypeError(`PostgreSQL#incrementValue expects the parameter 'amount' to be an integer greater or equal than zero. Got: ${amount}`);
		}

		return this.run(`UPDATE "${sanitizeKeyName(table)}" SET $2 = GREATEST(0, $2 - $3) WHERE id = $1;`, [id, key, amount]);
	}

	/**
	 * @param {string} table The name of the table to update
	 * @param {string} id The id of the row to delete
	 * @returns {Promise<any[]>}
	 */
	delete(table, id) {
		return this.run(`DELETE FROM "${sanitizeKeyName(table)}" WHERE id = $1;`, [id]);
	}

	/**
	 * Add a new column to a table's schema.
	 * @param {string} table The name of the table to edit.
	 * @param {(string|Array<string[]>)} key The key to add.
	 * @param {string} [datatype] The datatype for the new key.
	 * @returns {Promise<any[]>}
	 */
	addColumn(table, key, datatype) {
		if (typeof key === 'string') return this.run(`ALTER TABLE "${sanitizeKeyName(table)}" ADD COLUMN "${sanitizeKeyName(key)}" ${datatype};`);
		if (typeof datatype === 'undefined' && Array.isArray(key)) {
			return this.run(`ALTER TABLE "${sanitizeKeyName(table)}" ${key.map(([column, type]) =>
				`ADD COLUMN "${sanitizeKeyName(column)}" ${type}`).join(', ')};`);
		}
		throw new TypeError('Invalid usage of PostgreSQL#addColumn. Expected a string and string or string[][] and undefined.');
	}

	/**
	 * Remove a column from a table's schema.
	 * @param {string} table The name of the table to edit.
	 * @param {(string|string[])} key The key to remove.
	 * @returns {Promise<any[]>}
	 */
	removeColumn(table, key) {
		if (typeof key === 'string') return this.run(`ALTER TABLE "${sanitizeKeyName(table)}" DROP COLUMN "${sanitizeKeyName(key)}";`);
		if (Array.isArray(key)) return this.run(`ALTER TABLE "${sanitizeKeyName(table)}" DROP ${key.map(sanitizeKeyName).join(', ')};`);
		throw new TypeError('Invalid usage of PostgreSQL#removeColumn. Expected a string or string[].');
	}

	/**
	 * Edit the key's datatype from the table's schema.
	 * @param {string} table The name of the table to edit.
	 * @param {string} key The name of the column to update.
	 * @param {string} datatype The new datatype for the column.
	 * @returns {Promise<any[]>}
	 */
	updateColumn(table, key, datatype) {
		return this.run(`ALTER TABLE "${sanitizeKeyName(table)}" ALTER "${sanitizeKeyName(key)}" TYPE ${datatype};`);
	}

	/**
	 * Get a row from an arbitrary SQL query.
	 * @param {...any} sql The query to execute.
	 * @returns {Promise<Object>}
	 */
	run(...sql) {
		return this.db.query(...sql)
			.then(result => result)
			.catch(error => { throw `Failed query ${sql[0]}\n${error.stack || error}`; });
	}

	/**
	 * Get all entries from a table.
	 * @param {...any} sql The query to execute.
	 * @returns {Promise<any[]>}
	 */
	runAll(...sql) {
		return this.run(...sql)
			.then(result => result.rows);
	}

	/**
	 * Get one entry from a table.
	 * @param {...any} sql The query to execute.
	 * @returns {Promise<Object>}
	 */
	runOne(...sql) {
		return this.run(...sql)
			.then(result => result.rows[0]);
	}

};

/**
 * Accept any kind of input from two parameters.
 * @param {(string|string[]|{})} param1 The first parameter to validate.
 * @param {*} [param2] The second parameter to validate.
 * @returns {[[], []]}
 * @private
 */
function acceptArbitraryInput(param1, param2) {
	if (typeof param1 === 'undefined' && typeof param2 === 'undefined') return [[], []];
	if (typeof param1 === 'string' && typeof param2 !== 'undefined') return [[param1], [param2]];
	if (Array.isArray(param1) && Array.isArray(param2)) {
		if (param1.length !== param2.length) throw new TypeError(`The array lengths do not match: ${param1.length}-${param2.length}`);
		if (param1.some(value => typeof value !== 'string')) throw new TypeError(`The array of keys must be an array of strings, but found a value that does not match.`);
		return [param1, param2];
	}
	if (util.isObject(param1) && typeof param2 === 'undefined') {
		const entries = [[], []];
		getEntriesFromObject(param1, entries, '');
		return entries;
	}
	throw new TypeError('Invalid input. Expected a key type of string and a value, tuple of arrays, or an object and undefined.');
}

/**
 * Get all entries from an object.
 * @param {Object} object The object to "flatify".
 * @param {[string[], any[]]} param1 The tuple of keys and values to check.
 * @param {string} path The current path.
 * @private
 */
function getEntriesFromObject(object, [keys, values], path) {
	const objectKeys = Object.keys(object);
	for (let i = 0; i < objectKeys.length; i++) {
		const key = objectKeys[i];
		const value = object[key];
		if (util.isObject(value)) {
			getEntriesFromObject(value, [keys, values], path.length > 0 ? `${path}.${key}` : key);
		} else {
			keys.push(path.length > 0 ? `${path}.${key}` : key);
			values.push(value);
		}
	}
}

/**
 * @param {string} value The string to sanitize
 * @returns {string}
 * @private
 */
function sanitizeString(value) {
	if (value.length === 0) {
		throw new TypeError('%PostgreSQL.sanitizeString expects a string with a length bigger than 0.');
	}

	return `'${value.replace(/'/g, "''")}'`;
}

/**
 * @param {string} value The string to sanitize as a key
 * @returns {string}
 * @private
 */
function sanitizeKeyName(value) {
	if (typeof value !== 'string') { throw new TypeError(`%PostgreSQL.sanitizeString expects a string, got: ${typeof value}`); }
	if (/`/.test(value)) { throw new TypeError(`Invalid input (${value}).`); }

	return value;
}

/**
 * @param {number} [min] The minimum value
 * @param {number} [max] The maximum value
 * @returns {string}
 * @private
 */
function parseRange(min, max) {
	// Min value validation
	if (typeof min === 'undefined') return '';
	if (isNaN(min) || Number.isInteger(min) === false || Number.isSafeInteger(min) === false) {
		throw new TypeError(`%PostgreSQL.parseRange 'min' parameter expects an integer or undefined, got ${min}`);
	}
	if (min < 0) {
		throw new TypeError(`%PostgreSQL.parseRange 'min' parameter expects to be equal or greater than zero, got ${min}`);
	}

	// Max value validation
	if (typeof max !== 'undefined') {
		if (typeof max !== 'number' || isNaN(max) || Number.isInteger(max) === false || Number.isSafeInteger(max) === false) {
			throw new TypeError(`%PostgreSQL.parseRange 'max' parameter expects an integer or undefined, got ${max}`);
		}
		if (max <= min) {
			throw new TypeError(`%PostgreSQL.parseRange 'max' parameter expects ${max} to be greater than ${min}. Got: ${max} <= ${min}`);
		}
	}

	return `LIMIT ${min}${typeof max === 'number' ? `,${max}` : ''}`;
}

function makeVariables(number) {
	return new Array(number).fill().map((__, index) => `$${index + 1}`).join(', ');
}
