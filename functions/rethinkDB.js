const options = { db: "Skyra" };
const r = require("rethinkdbdash")(options);

class RethinkDB {
  constructor(rethinkdbdash) {
    Object.defineProperty(this, "r", { value: rethinkdbdash });
    this.hasTable = RethinkDB.hasTable;
    this.sync = RethinkDB.sync;
    this.createTable = RethinkDB.createTable;
    this.deleteTable = RethinkDB.deleteTable;

    this.all = RethinkDB.all;
    this.get = RethinkDB.get;
    this.getRandom = RethinkDB.getRandom;
    this.add = RethinkDB.add;
    this.update = RethinkDB.update;
    this.append = RethinkDB.append;
    this.replace = RethinkDB.replace;
    this.delete = RethinkDB.delete;
  }

  /* Table methods */
  static hasTable(table) {
    return r.tableList().run().then(data => data.includes(table));
  }

  static sync(table) {
    return r.table(table).sync().run();
  }

  static createTable(table) {
    return RethinkDB.hasTable(table).then((data) => {
      if (data) throw new Error("This table already exists.");
      return r.tableCreate(table).run();
    });
  }

  static deleteTable(table) {
    return RethinkDB.hasTable(table).then((data) => {
      if (!data) throw new Error("This table does not exist.");
      return r.tableDrop(table).run();
    });
  }

  /* Document methods */
  static all(table) {
    return r.table(table) || null;
  }

  static get(table, id) {
    return r.table(table).get(id) || null;
  }

  static getRandom(table) {
    return RethinkDB.all(table).then(data => data[Math.floor(Math.random() * data.length)]);
  }

  static add(table, doc) {
    if (!(doc instanceof Object)) throw new Error("Invalid input");
    return r.table(table).insert(doc).run();
  }

  static update(table, id, doc) {
    if (!(doc instanceof Object)) throw new Error("Invalid input");
    return r.table(table).get(id).update(doc).run();
  }

  static async append(table, id, appendArray, doc) {
    return r.table(table).get(id).update(object => ({ [appendArray]: object(appendArray).default([]).append(doc) })).run();
  }

  static async updateArray(table, id, uArray, index, doc) {
    if (typeof index === "number") {
      return r.table(table).get(id).update({ [uArray]: r.row(uArray).changeAt(index, r.row(uArray).nth(index).merge(doc)) }).run();
    }
    return r.table(table).get(id).update({ [uArray]: r.row(uArray).map(d => r.branch(d("id").eq(index), d.merge(doc), d)) }).run();
  }

  static replace(table, id, doc) {
    if (!(doc instanceof Object)) throw new Error("Invalid input");
    return r.table(table).get(id).replace(doc).run();
  }

  static delete(table, id) {
    return r.table(table).get(id).delete().run();
  }
}

module.exports = RethinkDB;
