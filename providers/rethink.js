const connection = { host: "localhost", port: 28015 };
const db = "Skyra";
const { promisify } = require("util");
const r = require("rethinkdb");

const connect = promisify(r.connect)(connection);

/* Table methods */

/**
 * Checks if the table exists.
 * @param {string} table the name of the table you want to check.
 * @returns {boolean}
 */
exports.hasTable = table => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).tableList()
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))))
    .then(data => data.includes(table));

/**
 * Creates a new table.
 * @param {string} table the name for the new table.
 * @returns {Object}
 */
exports.createTable = table => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).tableCreate(table)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

/**
 * Deletes a table.
 * @param {string} table the name of the table you want to drop.
 * @returns {Object}
 */
exports.deleteTable = table => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).tableDrop(table)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

/**
 * Sync the database.
 * @param {string} table the name of the table you want to sync.
 * @returns {Object}
 */
exports.sync = table => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).sync()
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

/* Document methods */

/**
 * Get all entries from a table.
 * @param {string} table the name of the table you want to get the data from.
 * @returns {?array}
 */
exports.getAll = table => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table)
        .run(conn, (err, res) => (err ? reject(err) : res.toArray().then(resolve)))));

/**
 * Get an entry from a table.
 * @param {string} table the name of the table.
 * @param {string|number} id the entry's ID.
 * @returns {?Object}
 */
exports.get = (table, id) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res || null)))));

/**
 * Check if an entry exists from a table.
 * @param {string} table the name of the table.
 * @param {string|number} id the entry's ID.
 * @returns {boolean}
 */
exports.has = (table, id) => this.get(table, id)
    .then(data => !!data)
    .catch(() => false);


  /**
   * Get a random entry from a table.
   * @param {string} table the name of the table.
   * @returns {Object}
   */
exports.getRandom = table => this.all(table).then(data => data[Math.floor(Math.random() * data.length)]);

  /**
   * Insert a new document into a table.
   * @param {string} table the name of the table.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.create = (table, doc) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).insert(doc)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));
exports.set = (...args) => this.create(...args);
exports.insert = (...args) => this.create(...args);

  /**
   * Update a document from a table given its ID.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.update = (table, id, doc) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).update(doc)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Replace the object from an entry with another.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {Object} doc the document in question to replace the current entry's properties.
   * @returns {Object}
   */
exports.replace = (table, id, doc) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).replace(doc)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Delete an entry from the table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @returns {Object}
   */
exports.delete = (table, id) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).delete()
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Insert an object into an array given the name of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.append = (table, id, uArray, doc) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).update(object => ({ [uArray]: object(uArray).default([]).append(doc) }))
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Update an object into an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.updateArrayByIndex = (table, id, uArray, index, doc) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).update({ [uArray]: r.row(uArray).changeAt(index, r.row(uArray).nth(index).merge(doc)) })
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Update an object into an array given the ID, the name of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @param {{}} doc the object you want to insert in the table.
   * @returns {{}}
   */
exports.updateArrayByID = (table, id, uArray, index, doc) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).update({ [uArray]: r.row(uArray).map(d => r.branch(d("id").eq(index), d.merge(doc), d)) })
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Remove an object from an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @returns {Object}
   */
exports.removeFromArrayByIndex = (table, id, uArray, index) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).update({ [uArray]: r.row(uArray).deleteAt(index) })
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Remove an object from an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @returns {Object}
   */
exports.removeFromArrayByID = (table, id, uArray, index) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id).update({ [uArray]: r.row(uArray).filter(it => it("id").ne(index)) })
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Get an object from an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @returns {Object}
   */
exports.getFromArrayByIndex = (table, id, uArray, index) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id)(uArray).nth(index)
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))));

  /**
   * Get an object into an array given the ID, the name of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @returns {?Object}
   */
exports.getFromArrayByID = (table, id, uArray, index) => new Promise((resolve, reject) => connect
    .then(conn => r.db(db).table(table).get(id)(uArray).filter(r.row("id").eq(index))
        .run(conn, (err, res) => (err ? reject(err) : resolve(res)))))
    .then(res => (res.length ? res[0] : null));
