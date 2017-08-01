const { resolve, join } = require('path');
const fs = require('fs-nextra');

const baseDir = join(__dirname, '../bwd/provider/json');
fs.ensureDir(baseDir).catch(console.error);

/* Table methods */

/**
 * Checks if a directory exists.
 * @param {string} table The name of the table you want to check.
 * @returns {Promise<boolean>}
 */
exports.hasTable = table => fs.pathExists(resolve(baseDir, table));

/**
 * Creates a new directory.
 * @param {string} table The name for the new directory.
 * @returns {Promise<Void>}
 */
exports.createTable = table => fs.mkdir(resolve(baseDir, table));

/**
 * Recursively deletes a directory.
 * @param {string} table The directory's name to delete.
 * @returns {Promise<Void>}
 */
exports.deleteTable = table => this.hasTable(table)
    .then(exists => exists ? fs.emptyDir(resolve(baseDir, table)).then(() => fs.remove(resolve(baseDir, table))) : null);

/* Document methods */

/**
 * Get all documents from a directory.
 * @param {string} table The name of the directory to fetch from.
 * @returns {Promise<Object[]>}
 */
exports.getAll = table => fs.readdir(resolve(baseDir, table))
    .then(files => Promise.all(files.map(file => fs.readJSON(resolve(baseDir, table, file)))));

/**
 * Get a document from a directory.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<?Object>}
 */
exports.get = (table, document) => fs.readJSON(resolve(baseDir, table, `${document}.json`)).catch(() => null);

/**
 * Check if the document exists.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<boolean>}
 */
exports.has = (table, document) => fs.pathExists(resolve(baseDir, table, `${document}.json`));

/**
 * Get a random document from a directory.
 * @param {string} table The name of the directory.
 * @returns {Promise<Object>}
 */
exports.getRandom = table => this.getAll(table).then(data => data[Math.floor(Math.random() * data.length)]);

/**
 * Insert a new document into a directory.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The object with all properties you want to insert into the document.
 * @returns {Promise<Void>}
 */
exports.create = (table, document, data) => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), Object.assign(data, { id: document }));
exports.set = (...args) => this.create(...args);
exports.insert = (...args) => this.create(...args);

/**
 * Update a document from a directory.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The object with all the properties you want to update.
 * @returns {Promise<Void>}
 */
exports.update = (table, document, data) => this.get(table, document)
    .then(current => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), Object.assign(current, data)));

/**
 * Replace all the data from a document.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @param {Object} data The new data for the document.
 * @returns {Promise<Void>}
 */
exports.replace = (table, document, data) => fs.outputJSONAtomic(resolve(baseDir, table, `${document}.json`), data);

/**
 * Delete a document from the table.
 * @param {string} table The name of the directory.
 * @param {string} document The document name.
 * @returns {Promise<Void>}
 */
exports.delete = (table, document) => fs.unlink(resolve(baseDir, table, `${document}.json`));
