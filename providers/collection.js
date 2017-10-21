const { Collection } = require('discord.js');

class ExpandedCollection {

    constructor() {
        this.database = new Collection();
    }

    /* Table methods */

    /**
	 * Checks if a table exists.
	 * @param {string} table The name of the table you want to check.
	 * @returns {boolean}
	 */
    hasTable(table) {
        return this.database.has(table);
    }

    /**
	 * Get the raw data from a table.
	 * @param {string} table The table to get the data from.
	 * @returns {Collection<string, Object>}
	 */
    getTable(table) {
        return this.database.get(table) || this.createTable(table).get(table);
    }

    /**
	 * Creates a new table.
	 * @param {string} table The name for the new table.
	 * @returns {Collection<string, Collection<string, Object>>}
	 */
    createTable(table) {
        return this.database.set(table, new Collection());
    }

    /**
	 * Recursively deletes a table.
	 * @param {string} table The table's name to delete.
	 * @returns {boolean}
	 */
    deleteTable(table) {
        return this.database.delete(table);
    }

    /* Entry methods */

    /**
	 * Get all the values from a table.
	 * @param {string} table The name of the table to fetch from.
	 * @returns {Object[]}
	 */
    getAll(table) {
        return Array.from(this.getTable(table).values());
    }

    /**
	 * Get all the keys from a table.
	 * @param {string} table The name of the table to fetch the keys from.
	 * @returns {string[]}
	 */
    getKeys(table) {
        return Array.from(this.getTable(table).keys());
    }

    /**
	 * Get a entry from a table.
	 * @param {string} table The name of the table.
	 * @param {string} entry The entry name.
	 * @returns {?Object}
	 */
    get(table, entry) {
        const collection = this.getTable(table);
        return collection.get(entry) || null;
    }

    /**
	 * Check if the entry exists.
	 * @param {string} table The name of the table.
	 * @param {string} entry The entry name.
	 * @returns {boolean}
	 */
    has(table, entry) {
        return !!this.get(table, entry);
    }

    /**
	 * Get a random entry from a table.
	 * @param {string} table The name of the table.
	 * @returns {Object}
	 */
    getRandom(table) {
        const array = this.getAll(table);
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
	 * Insert a new entry into a table.
	 * @param {string} table The name of the table.
	 * @param {string} entry The entry name.
	 * @param {Object} data The object with all properties you want to insert into the entry.
	 * @returns {void}
	 */
    create(table, entry, data) {
        const collection = this.getTable(table);
        return collection.set(entry, data);
    }

    set(...args) {
        return this.create(...args);
    }

    insert(...args) {
        return this.create(...args);
    }

    /**
	 * Update a entry from a table.
	 * @param {string} table The name of the table.
	 * @param {string} entry The entry name.
	 * @param {Object} data The object with all the properties you want to update.
	 * @returns {Collection<string, Object>}
	 */
    update(table, entry, data) {
        return this.getTable(table).set(entry, data);
    }

    /**
	 * Delete a entry from the table.
	 * @param {string} table The name of the table.
	 * @param {string} entry The entry name.
	 * @returns {boolean}
	 */
    delete(table, entry) {
        const collection = this.getTable(table);
        return collection.delete(entry);
    }

}

module.exports = new ExpandedCollection();
