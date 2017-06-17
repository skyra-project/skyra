const constants = require("../utils/constants");

const $ = (name) => { throw new Error(`${name} is a required argument.`); };

/* eslint-disable valid-jsdoc, no-underscore-dangle, no-prototype-builtins */
class WatchPoint {
  constructor(client) {
    Object.defineProperty(this, "_client", { value: client });
    Object.defineProperty(this, "request", { value: client.funcs.fetch });
    Object.defineProperty(this, "_keys", { value: constants.tokens.wpo });
    Object.defineProperty(this, "auth", { value: `Basic ${new Buffer(`${this._keys.user}:${this._keys.password}`).toString("base64")}` });
  }

  API(method, query) {
    return this.request(`http://www.watchpointoasis.com/api/currency/${query}`, {
      headers: { Authorization: this.auth },
      json: true,
      method,
    });
  }

  /**
    * Method [GET]
    * list/{guildId}
    * Get an array of objects containing data from all users.
    * @returns {Object}
    */
  list(guild = $("Guild")) {
    return this.API("GET", `list/${guild}`)
      .then(body => this.cachelist(guild, body));
  }

  cachelist(guild, data) {
    if (this._client.cache.wpo.has(guild)) this._client.cache.wpo.delete(guild);
    this._client.cache.wpo.set(guild, new Map());
    const guildCache = this._client.cache.wpo.get(guild);
    data.forEach(profile => guildCache.set(profile.UserId, profile));
    return this._client.cache.wpo.get(guild.id);
  }

  /**
    * Method [POST]
    * set/{guildId} /{userId} /{balance} /{reason}
    * Add a new record to the database.
    * @returns {Object}
    */
  set(guild = $("Guild"), user = $("User"), bal = $("Balance"), reason = "") {
    const balance = parseInt(bal);
    if (isNaN(balance)) throw new TypeError(`${bal} is not a valid Number.`);
    return this.API("POST", `set/${guild}/${user}/${balance}/${encodeURIComponent(reason)}`);
  }

  /**
    * Method [GET]
    * get/{guildId} /{userId}
    * Get the data from a user.
    * @returns {Object}
    */
  get(guild = $("Guild"), user = $("User")) {
    return this.API("GET", `get/${guild}/${user}`);
  }

  /**
    * Method [POST]
    * use/{guildId} /{userId} /{balance} /{reason}
    * Fetch if the user has enough balance to buy an item.
    * Reason is optional.
    * @returns {Object}
    */
  use(guild = $("Guild"), user = $("User"), bal = $("Balance"), reason = "") {
    const balance = parseInt(bal);
    if (isNaN(balance)) throw new TypeError(`${bal} is not a valid Number.`);
    return this.API("POST", `use/${guild}/${user}/${balance}/${encodeURIComponent(reason)}`);
  }

  /**
    * Method [PUT]
    * add/{guildId} /{userId} /{balance} /{reason}
    * Add points to an user.
    * Reason is optional.
    * @returns {Object}
    */
  add(guild = $("Guild"), user = $("User"), bal = $("Balance"), reason = "") {
    const balance = parseInt(bal);
    if (isNaN(balance)) throw new TypeError(`${bal} is not a valid Number.`);
    return this.API("PUT", `add/${guild}/${user}/${balance}/${encodeURIComponent(reason)}`);
  }

  /**
    * Method [GET]
    * history/{guildId} /{userId}
    * Get a list of all modifications.
    * @returns {Object}
    */
  history(guild = $("Guild"), user = $("User")) {
    return this.API("GET", `history/${guild}/${user}`);
  }
}

module.exports = WatchPoint;

// exports.init = (client) => {
//   if (!client.hasOwnProperty("cache")) client.cache = {};
//   client.cache.wpo = new Map();
//   client.wpo = new WatchPoint(client);
//   // client.wpo.list("256566731684839428");
// };
