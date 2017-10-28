const Schema = require('./Schema');
const { resolve } = require('path');
const fs = require('fs-nextra');

class Gateway {

    /**
	 * @typedef  {Object} GatewayOptions
	 * @property {Provider} provider
	 * @property {CacheProvider} cache
	 * @memberof Gateway
	 */

    /**
	 * @param {SettingsCache} store The SettingsCache instance which initiated this instance.
	 * @param {string} type The name of this Gateway.
	 * @param {Object} schema The initial schema for this instance.
	 * @param {GatewayOptions} options The options for this schema.
	 */
    constructor(store, type, schema, options) {
        /**
		 * @type {SettingsCache}
		 */
        this.store = store;

        /**
		 * @type {string}
		 */
        this.type = type;

        /**
		 * @type {GatewayOptions}
		 */
        this.options = options;

        /**
		 * @type {Object}
		 */
        this.defaultSchema = schema;

        /**
		 * @type {Schema}
		 */
        this.schema = null;
    }

    /**
	 * Inits the table and the schema for its use in this gateway.
	 * @returns {Promise<void[]>}
	 */
    init() {
        return Promise.all([
            this.initSchema().then(schema => { this.schema = new Schema(this.client, this, schema, ''); }),
            this.initTable()
        ]);
    }

    /**
	 * Inits the table for its use in this gateway.
	 */
    async initTable() {
        const hasTable = await this.provider.hasTable(this.type);
        if (!hasTable) await this.provider.createTable(this.type);
    }

    /**
	 * Inits the schema, creating a file if it does not exist, and returning the current schema or the default.
	 * @returns {Promise<Object>}
	 */
    async initSchema() {
        const baseDir = resolve(this.client.baseDir, 'bwd');
        await fs.ensureDir(baseDir);
        this.filePath = resolve(baseDir, `${this.type}_Schema.json`);
        return fs.readJSON(this.filePath)
            .catch(() => fs.outputJSONAtomic(this.filePath, this.defaultSchema).then(() => this.defaultSchema));
    }

    /**
	 * Get an entry from the cache.
	 * @param {string} input The key to get from the cache.
	 * @returns {Object}
	 */
    getEntry(input) {
        if (input === 'default') return this.defaults;
        const guild = this._resolveGuild(input);
        return this.client.handler.guilds.get(guild.id);
    }

    /**
	 * Create a new entry into the database with an optional content (defaults to this Gateway's defaults).
	 * @param {string} input The name of the key to create.
	 * @param {Object} [data={}] The initial data to insert.
	 * @returns {Promise<true>}
	 */
    async createEntry(input) {
        const target = this.validate(input);
        await this.client.handler.guilds.delete(target);
        return true;
    }

    /**
	 * Delete an entry from the database and cache.
	 * @param {string} input The name of the key to fetch and delete.
	 * @returns {Promise<true>}
	 */
    async deleteEntry(input) {
        await this.client.handler.guilds.delete(input);
        return true;
    }

    /**
	 * Sync either all entries from the cache with the persistent database, or a single one.
	 * @param {(Object|string)} [input=null] An object containing a id property, like discord.js objects, or a string.
	 * @returns {Promise<void>}
	 */
    async sync(input = null) {
        if (input === null)
            throw new Error('You must pass a guild resolvable as an argument to Gateway#sync');

        const settings = await this.getEntry(input);
        return settings.sync();
    }

    /**
	 * Reset a value from an entry.
	 * @param {string} target The entry target.
	 * @param {string} key The key to reset.
	 * @param {boolean} [avoidUnconfigurable=false] Whether the Gateway should avoid configuring the selected key.
	 * @returns {Promise<{ value: any, path: SchemaPiece }>}
	 */
    async reset(target, key, avoidUnconfigurable = false) {
        if (typeof key !== 'string') throw new TypeError(`The argument key must be a string. Received: ${typeof key}`);
        const guild = this._resolveGuild(target);
        target = this.validate(target);
        const { path, route } = this.getPath(key, { avoidUnconfigurable, piece: true });

        const { parsed, settings } = await this._reset(target, key, guild, { path, route });

        await guild.settings.update(settings);
        return { value: parsed, path };
    }

    async _reset(target, key, guild, { path, route }) {
        const parsedID = path.default;
        let cache = {};
        const fullObject = cache;

        for (let i = 0; i < route.length - 1; i++)
            cache = cache[route[i]] = {};

        cache[route[route.length - 1]] = parsedID;

        return { parsed: parsedID, settings: fullObject, array: null };
    }

    /**
	 * Update a value from an entry.
	 * @param {string} target The entry target.
	 * @param {string} key The key to modify.
	 * @param {string} value The value to parse and save.
	 * @param {boolean} [avoidUnconfigurable=false] Whether the Gateway should avoid configuring the selected key.
	 * @returns {Promise<{ value: any, path: SchemaPiece }>}
	 */
    async updateOne(target, key, value, avoidUnconfigurable = false) {
        if (typeof key !== 'string') throw new TypeError(`The argument key must be a string. Received: ${typeof key}`);
        const guild = this._resolveGuild(target);
        target = this.validate(target);
        const { path, route } = this.getPath(key, { avoidUnconfigurable, piece: true });

        const { parsed, settings } = path.array === true
            ? await this._updateArray(target, 'add', key, value, guild, { path, route })
            : await this._updateOne(target, key, value, guild, { path, route });

        await guild.settings.update(settings);
        return { value: parsed.data, path };
    }

    async _updateOne(target, key, value, guild, { path, route }) {
        if (path.array === true) throw 'This key is array type.';

        const parsed = await path.parse(value, guild);
        const parsedID = parsed.data && parsed.data.id ? parsed.data.id : parsed.data;

        let cache = {};
        const fullObject = cache;

        for (let i = 0; i < route.length - 1; i++)
            cache = cache[route[i]] = {};

        cache[route[route.length - 1]] = parsedID;

        return { parsed, settings: fullObject, array: null };
    }

    /**
	 * Update multiple keys given a JSON object.
	 * @param {string} target The entry target.
	 * @param {Object} object A JSON object to iterate and parse.
	 * @returns {Promise<{ settings: Object, errors: string[] }>}
	 */
    async updateMany(target, object) {
        const guild = this._resolveGuild(target);
        target = this.validate(target);
        const list = { errors: [], promises: [] };
        const cache = await guild.settings;

        const settings = cache;
        this._updateMany(cache, object, this.schema, guild, list);
        await Promise.all(list.promises);

        await guild.settings.update(settings);
        return { settings, errors: list.errors };
    }

    _updateMany(cache, object, schema, guild, list) {
        const keys = Object.keys(object);
        for (let i = 0; i < keys.length; i++) {
            if (schema.has(keys[i]) === false) continue;
            if (schema[keys[i]].type === 'Folder') {
                this._updateMany(cache[keys[i]], object[keys[i]], schema[keys[i]], guild, list);
                continue;
            }
            list.promises.push(schema[keys[i]].parse(object[keys[i]], guild)
                .then(result => { cache[keys[i]] = result && result.data && result.data.id ? result.data.id : result.data; })
                .catch(error => list.errors.push([schema[keys[i]].path, error])));
        }
    }

    /**
	 * Update an array from an entry.
	 * @param {string} target The entry target.
	 * @param {('add'|'remove')} action Whether the value should be added or removed to the array.
	 * @param {string} key The key to modify.
	 * @param {string} value The value to parse and save or remove.
	 * @param {boolean} [avoidUnconfigurable=false] Whether the Gateway should avoid configuring the selected key.
	 * @returns {Promise<{ value: any, path: SchemaPiece }>}
	 */
    async updateArray(target, action, key, value, avoidUnconfigurable = false) {
        if (action !== 'add' && action !== 'remove')
            throw new TypeError('The argument \'action\' for Gateway#updateArray only accepts the strings \'add\' and \'remove\'.');
        if (typeof key !== 'string')
            throw new TypeError(`The argument key must be a string. Received: ${typeof key}`);

        const guild = this._resolveGuild(target);
        target = this.validate(target);
        const { path, route } = this.getPath(key, { avoidUnconfigurable, piece: true });

        const { parsed, settings } = path.array === true
            ? await this._updateArray(target, action, key, value, guild, { path, route })
            : await this._updateOne(target, key, value, guild, { path, route });

        await guild.settings.update(settings);
        return { value: parsed.data, path };
    }

    async _updateArray(target, action, key, value, guild, { path, route }) {
        if (path.array === false) throw guild.language.get('COMMAND_CONF_KEY_NOT_ARRAY');

        const parsed = await path.parse(value, guild);
        const parsedID = parsed.data && parsed.data.id ? parsed.data.id : parsed.data;

        let objQuery = {};
        let cache = await this.getEntry(target);

        for (let i = 0; i < route.length - 1; i++) {
            objQuery = objQuery[route[i]] = {};
            if (typeof cache[route[i]] === 'undefined') cache[route[i]] = {};
            cache = cache[route[i]];
        }

        objQuery = cache[route[route.length - 1]];

        if (action === 'add') {
            if (objQuery.includes(parsedID)) throw `The value ${parsedID} for the key ${path.path} already exists.`;
            objQuery.push(parsedID);
        } else {
            const index = objQuery.indexOf(parsedID);
            if (index === -1) throw `The value ${parsedID} for the key ${path.path} does not exist.`;
            objQuery.splice(index, 1);
        }

        return { parsed, settings: objQuery, array: cache };
    }

    /**
	 * Resolve a path from a string.
	 * @param {string} [key=null] A string to resolve.
	 * @param {Object} [options={}] Whether the Gateway should avoid configuring the selected key.
	 * @returns {{ path: SchemaPiece, route: string[] }}
	 */
    getPath(key = '', { avoidUnconfigurable = false, piece = true } = {}) {
        if (key === '') return { path: this.schema, route: [] };
        if (typeof key !== 'string') throw new TypeError('The value for the argument \'key\' must be a string.');
        const route = key.split('.');
        let path = this.schema;

        for (let i = 0; i < route.length; i++) {
            if (path.keys.has(route[i]) === false) throw `The key ${route.slice(0, i).join('.')} does not exist in the current schema.`;
            if (i < route.length - 1) {
                path = path[route[i]];
                continue;
            }
            if (piece === true) {
                if (path[route[i]].type === 'Folder') throw `Please, choose one of the following keys: '${Object.keys(path).join('\', \'')}'`;
                if (avoidUnconfigurable === true && path[route[i]].configurable === false) throw `The key ${path.path} is not configureable in the current schema.`;
                path = path[route[i]];
            } else
            if (path[route[i]].type === 'Folder') {
                path = path[route[i]];
            }
        }

        return { path, route };
    }

    /**
	 * The validator function for guild settings.
	 * @param {(Object|string)} guild The data to validate.
	 * @returns {string}
	 */
    validate(guild) {
        const result = this._resolveGuild(guild);
        if (!result) throw 'The parameter <Guild> expects either a Guild ID or a Guild Object.';
        return result && result.id ? result.id : result;
    }

    _resolveGuild(guild) {
        const constName = guild.constructor.name;
        if (constName === 'Guild') return guild;
        if (constName === 'TextChannel' || constName === 'VoiceChannel' || constName === 'Message' || constName === 'Role') return guild.guild;
        if (typeof guild === 'string' && /^\d{17,19}$/.test(guild)) return this.client.guilds.get(guild);
        return null;
    }

    /**
	 * Get the provider that manages the persistent data.
	 * @type {Provider}
	 * @readonly
	 */
    get provider() {
        return this.options.provider;
    }

    /**
	 * Get this gateway's defaults.
	 * @type {Object}
	 * @readonly
	 */
    get defaults() {
        return Object.assign(this.schema.defaults, { default: true });
    }

    /**
	 * The client this SettingGateway was created with.
	 * @type {Client}
	 * @readonly
	 */
    get client() {
        return this.store.client;
    }

    /**
	 * The resolver instance this SettingGateway uses to parse the data.
	 * @type {Resolver}
	 * @readonly
	 */
    get resolver() {
        return this.store.resolver;
    }

}

module.exports = Gateway;
