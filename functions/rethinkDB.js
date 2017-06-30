const options = { db: "Skyra" };
const r = require("rethinkdbdash")(options);

exports.eval = r;

/* Table methods */


  /**
   * Checks if the table exists.
   *
   * @param {string} table the name of the table you want to check.
   * @returns {boolean}
   */
exports.hasTable = table => r.tableList().run().then(data => data.includes(table));

  /**
   * Sync the database.
   *
   * @param {string} table the name of the table you want to sync.
   * @returns {Object}
   */
exports.sync = table => r.table(table).sync().run();

  /**
   * Creates a new table.
   *
   * @param {string} table the name for the new table.
   * @returns {Object}
   */
exports.createTable = table => this.hasTable(table).then((data) => {
  if (data) throw new Error("This table already exists.");
  return r.tableCreate(table).run();
});

  /**
   * Deletes a table.
   *
   * @param {string} table the name of the table you want to drop.
   * @returns {Object}
   */
exports.deleteTable = table => this.hasTable(table).then((data) => {
  if (!data) throw new Error("This table does not exist.");
  return r.tableDrop(table).run();
});

/* Document methods */

  /**
   * Get all entries from a table.
   *
   * @param {string} table the name of the table you want to get the data from.
   * @returns {?array}
   */
exports.all = table => r.table(table) || null;

  /**
   * Get an entry from a table.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @returns {?Object}
   */
exports.get = (table, id) => r.table(table).get(id) || null;

  /**
   * Get a random entry from a table.
   *
   * @param {string} table the name of the table.
   * @returns {Object}
   */
exports.getRandom = table => this.all(table).then(data => data[Math.floor(Math.random() * data.length)]);

  /**
   * Insert a new document into a table.
   *
   * @param {string} table the name of the table.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.add = (table, doc) => {
  if (!(doc instanceof Object)) throw new Error("Invalid input");
  return r.table(table).insert(doc).run();
};

  /**
   * Update a document from a table given its ID.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.update = (table, id, doc) => {
  if (!(doc instanceof Object)) throw new Error("Invalid input");
  return r.table(table).get(id).update(doc).run();
};

  /**
   * Replace the object from an entry with another.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {Object} doc the document in question to replace the current entry's properties.
   * @returns {Object}
   */
exports.replace = (table, id, doc) => {
  if (!(doc instanceof Object)) throw new Error("Invalid input");
  return r.table(table).get(id).replace(doc).run();
};

  /**
   * Delete an entry from the table.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @returns {Object}
   */
exports.delete = (table, id) => r.table(table).get(id).delete().run();

  /**
   * Insert an object into an array given the name of the array, entry ID and table.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} appendArray the name of the array you want to update.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.append = (table, id, appendArray, doc) => r.table(table).get(id).update(object => ({ [appendArray]: object(appendArray).default([]).append(doc) })).run();

  /**
   * Update an object into an array given the position/ID from the array, entry ID and table.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @param {Object} doc the object you want to insert in the table.
   * @returns {Object}
   */
exports.updateArray = (table, id, uArray, index, doc) => {
  if (typeof index === "number") {
    return r.table(table).get(id).update({ [uArray]: r.row(uArray).changeAt(index, r.row(uArray).nth(index).merge(doc)) }).run();
  }
  return r.table(table).get(id).update({ [uArray]: r.row(uArray).map(d => r.branch(d("id").eq(index), d.merge(doc), d)) }).run();
};

  /**
   * Remove an object from an array given the position/ID from the array, entry ID and table.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {number} index the position of the object inside the array.
   * @returns {Object}
   */
exports.removeFromArray = (table, id, uArray, index) => {
  if (typeof index === "number") {
    return r.table(table).get(id).update({ [uArray]: r.row(uArray).deleteAt(index) }).run();
  }
  return r.table(table).get(id).update({ [uArray]: r.row(uArray).filter(it => it("id").ne(index)) }).run();
};

  /**
   * Remove an object from an array given the position/ID from the array, entry ID and table.
   *
   * @param {string} table the name of the table.
   * @param {string|number} id the entry's ID.
   * @param {string} uArray the name of the array you want to update.
   * @param {string} index the ID of the object inside the array.
   * @returns {Object}
   */
exports.getFromArray = async (table, id, uArray, index) => {
  if (typeof index === "number") {
    return r.table(table).get(id)(uArray).nth(index).run();
  }
  const result = await r.table(table).get(id)(uArray).filter(r.row("id").eq(index)).run();
  return result.length ? result[0] : null;
};
