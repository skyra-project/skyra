const config = {
    moduleName: "rethink",
    enabled: true,
    requiredModules: ["rethinkdbdash"],
};

const r = require("rethinkdbdash")();

exports.exec = r;

  /* Table methods */

  /**
   * Checks if the table exists.
   * @param {string} table the name of the table you want to check.
   * @returns {boolean}
   */
exports.hasTable = table => r.tableList().run().then(data => data.includes(table));

  /**
   * Creates a new table.
   * @param {string} table the name for the new table.
   * @returns {Object}
   */
exports.createTable = table => r.tableCreate(table).run();

  /**
   * Deletes a table.
   * @param {string} table the name of the table you want to drop.
   * @returns {Object}
   */
exports.deleteTable = table => r.tableDrop(table).run();

  /**
   * Sync the database.
   * @param {string} table the name of the table you want to sync.
   * @returns {Object}
   */
exports.sync = table => r.table(table).sync().run();

  /* Document methods */

  /**
   * Get all entries from a table.
   * @param {string} table the name of the table you want to get the data from.
   * @returns {?array}
   */
exports.getAll = table => r.table(table) || null;

  /**
   * Get an entry from a table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @returns {?Object}
   */
exports.get = (table, id) => r.table(table).get(id) || null;

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
exports.create = (table, doc) => r.table(table).insert(doc).run();
exports.set = (...args) => this.create(...args);
exports.insert = (...args) => this.create(...args);

  /**
   * Update a document from a table given its ID.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.update = (table, id, doc) => r.table(table).get(id).update(doc).run();

  /**
   * Replace the object from an entry with another.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {Object} doc the document in question to replace the current entry's properties.
   * @returns {Object}
   */
exports.replace = (table, id, doc) => r.table(table).get(id).replace(doc).run();

  /**
   * Delete an entry from the table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @returns {Object}
   */
exports.delete = (table, id) => r.table(table).get(id).delete().run();

  /**
   * Insert an object into an array given the name of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.append = (table, id, uArray, doc) => r.table(table).get(id).update(object => ({ [uArray]: object(uArray).default([]).append(doc) })).run();

  /**
   * Update an object into an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.updateArrayByIndex = (table, id, uArray, index, doc) => r.table(table).get(id).update({ [uArray]: r.row(uArray).changeAt(index, r.row(uArray).nth(index).merge(doc)) }).run();

  /**
   * Update an object into an array given the ID, the name of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.updateArrayByID = (table, id, uArray, index, doc) => r.table(table).get(id).update({ [uArray]: r.row(uArray).map(d => r.branch(d("id").eq(index), d.merge(doc), d)) }).run();

  /**
   * Remove an object from an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @returns {Object}
   */
exports.removeFromArrayByIndex = (table, id, uArray, index) => r.table(table).get(id).update({ [uArray]: r.row(uArray).deleteAt(index) }).run();

  /**
   * Remove an object from an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @returns {Object}
   */
exports.removeFromArrayByID = (table, id, uArray, index) => r.table(table).get(id).update({ [uArray]: r.row(uArray).filter(it => it("id").ne(index)) }).run();

  /**
   * Get an object from an array given the position of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @returns {Object}
   */
exports.getFromArrayByIndex = (table, id, uArray, index) => r.table(table).get(id)(uArray).nth(index).run();

  /**
   * Get an object into an array given the ID, the name of the array, entry ID and table.
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @returns {?Object}
   */
exports.getFromArrayByID = (table, id, uArray, index) => r.table(table).get(id)(uArray).filter(r.row("id").eq(index)).run().then(res => (res.length ? res[0] : null));

  /* Exports for the Download command */

exports.conf = config;
