const SchemaPiece = require('./SchemaPiece');
const fs = require('fs-nextra');

class Schema {

    constructor(client, manager, object, path) {
        /**
		 * The Discord client.
		 * @type {Client}
		 */
        Object.defineProperty(this, 'client', { value: client });

        /**
		 * The Gateway that manages this schema instance.
		 * @type {Gateway}
		 */
        Object.defineProperty(this, 'manager', { value: manager });

        /**
		 * The path of this schema instance.
		 * @type {string}
		 */
        Object.defineProperty(this, 'path', { value: path });

        /**
		 * The type of this schema instance.
		 * @type {'Folder'}
		 */
        Object.defineProperty(this, 'type', { value: 'Folder' });

        /**
		 * The default values for this schema instance and children.
		 * @type {Object}
		 */
        Object.defineProperty(this, 'defaults', { value: {}, writable: true });

        /**
		 * A Set containing all keys' names which value is either a Schema or a SchemaPiece instance.
		 * @type {Set<string>}
		 */
        Object.defineProperty(this, 'keys', { value: new Set(), writable: true });

        /**
		 * A pre-processed array with all keys' names.
		 * @type {string[]}
		 */
        Object.defineProperty(this, '_keys', { value: [], writable: true });

        this._patch(object);
    }

    /**
	 * Create a new nested folder.
	 * @param {string} key The name's key for the folder.
	 * @param {Object} [object={}] An object containing all the Schema/SchemaPieces literals for this folder.
	 * @param {boolean} [force=true] Whether this function call should modify all entries from the database.
	 * @returns {Promise<Schema>}
	 */
    async addFolder(key, object = {}, force = true) {
        if (typeof this[key] !== 'undefined') throw `The key ${key} already exists in the current schema.`;
        this.keys.add(key);
        this._keys.push(key);
        this[key] = new Schema(this.client, this.manager, object, `${this.path === '' ? '' : `${this.path}.`}${key}`);
        this.defaults[key] = this[key].defaults;
        await fs.outputJSONAtomic(this.manager.filePath, this.manager.schema.toJSON());

        if (force) await this.force('add', key);
        return this.manager.schema;
    }

    /**
	 * Remove a nested folder.
	 * @param {string} key The folder's name to remove.
	 * @param {boolean} [force=true] Whether this function call should modify all entries from the database.
	 * @returns {Promise<Schema>}
	 */
    async removeFolder(key, force = true) {
        if (this.keys.has(key) === false) throw new Error(`The key ${key} does not exist in the current schema.`);
        if (this[key].type !== 'Folder') throw new Error(`The key ${key} is not Folder type.`);
        this._removeKey(key);
        await fs.outputJSONAtomic(this.manager.filePath, this.manager.schema.toJSON());

        if (force) await this.force('delete', key);
        return this.manager.schema;
    }

    /**
	 * Check if the table exists in this folder.
	 * @param {string} key The key to check.
	 * @returns {boolean}
	 */
    has(key) {
        return this.keys.has(key);
    }

    /**
	 * @typedef  {Object} AddOptions
	 * @property {string}  type The type for the key.
	 * @property {any}     [default] The default value for the key.
	 * @property {number}  [min] The min value for the key (String.length for String, value for number).
	 * @property {number}  [max] The max value for the key (String.length for String, value for number).
	 * @property {boolean} [array] Whether the key should be stored as Array or not.
	 * @property {boolean} [configurable] Whether the key should be configurable by the config command or not.
	 * @memberof Schema
	 */

    /**
	 * Add a new key to this folder.
	 * @param {string} key The name for the key.
	 * @param {AddOptions} [options=null] The key's options to apply.
	 * @param {boolean} [force=true] Whether this function call should modify all entries from the database.
	 * @returns {Promise<Schema>}
	 */
    async addKey(key, options = null, force = true) {
        if (typeof this[key] !== 'undefined') throw `The key ${key} already exists in the current schema.`;
        if (options === null) throw 'You must pass an options argument to this method.';
        if (typeof options.type !== 'string') throw 'The option type is required and must be a string.';
        options.type = options.type.toLowerCase();
        if (this.client.settings.types.includes(options.type) === false) throw `The type ${options.type} is not supported.`;
        if (typeof options.min !== 'undefined' && isNaN(options.min)) throw 'The option min must be a number.';
        if (typeof options.max !== 'undefined' && isNaN(options.max)) throw 'The option max must be a number.';
        if (typeof options.array !== 'undefined' && typeof options.array !== 'boolean') throw 'The option array must be a boolean.';
        if (typeof options.configurable !== 'undefined' && typeof options.configurable !== 'boolean') throw 'The option configurable must be a boolean.';

        if (options.array === true) {
            if (typeof options.default === 'undefined') options.default = [];
            else if (Array.isArray(options.default) === false) throw 'The option default must be an array if the array option is set to true.';
        } else {
            if (typeof options.default === 'undefined') options.default = options.type === 'boolean' ? false : null;
            options.array = false;
        }
        this._addKey(key, options);
        await fs.outputJSONAtomic(this.manager.filePath, this.manager.schema.toJSON());

        if (force) await this.force('add', key, this[key]);
        return this.manager.schema;
    }

    _addKey(key, options) {
        this.keys.add(key);
        this._keys.push(key);
        this._keys.sort((a, b) => a.localeCompare(b));
        this[key] = new SchemaPiece(this.client, this.manager, options, `${this.path === '' ? '' : `${this.path}.`}${key}`, key);
        this.defaults[key] = options.default;
    }

    /**
	 * Remove a key from this folder.
	 * @param {string} key The key's name to remove.
	 * @param {boolean} [force=true] Whether this function call should modify all entries from the database.
	 * @returns {Promise<Schema>}
	 */
    async removeKey(key, force = true) {
        if (this.keys.has(key) === false) throw `The key ${key} does not exist in the current schema.`;
        this._removeKey(key);
        await fs.outputJSONAtomic(this.manager.filePath, this.manager.schema.toJSON());

        if (force) await this.force('delete', key);
        return this.manager.schema;
    }

    _removeKey(key) {
        const index = this._keys.indexOf(key);

        this.keys.delete(key);
        this._keys.splice(index, 1);
        delete this[key];
        delete this.defaults[key];
    }

    /**
	 * Modifies all entries from the database. Do NOT call without knowledge.
	 * @param {('add'|'delete')} action The action to perform.
	 * @param {string} key The key to handle.
	 * @returns {Promise<boolean[]>}
	 */
    async force(action, key) {
        const data = await this.manager.provider.getAll(this.manager.type);
        const value = action === 'add' ? this.defaults[key] : null;
        const path = this.path.split('.');

        return Promise.all(data.map(async (obj) => {
            if (typeof obj.id !== 'string') return false;

            let settings = this.client.handler.guilds.get(obj.id);
            let object = obj;
            for (let i = 0; i < path.length; i++) {
                settings = settings[path[i]] || {};
                object = object[path[i]] || {};
            }
            if (action === 'delete') {
                delete object[key];
                delete settings[key];
            } else {
                settings[key] = value;
            }

            return this.manager.provider.replace(this.manager.type, obj.id, obj);
        }));
    }

    /**
	 * Get a JSON object containing all the objects from this schema's children.
	 * @returns {Object}
	 */
    toJSON() {
        return Object.assign({ type: 'Folder' }, ...this._keys.map(key => ({ [key]: this[key].toJSON() })));
    }

    /**
	 * Get a JSON object with all the default values.
	 * @returns {Object}
	 */
    getDefaults() {
        const object = {};
        for (let i = 0; i < this._keys.length; i++) object[this._keys[i]] = this[this._keys[i]].getDefaults();
        return object;
    }

    /**
	 * Get all the pathes from this schema's children.
	 * @param {string[]} [array=[]] The array to push.
	 * @returns {string[]}
	 */
    getKeys(array = []) {
        return this._keys.map(key => this[key].getKeys(array));
    }

    /**
	 * Get all the SchemaPieces instances from this schema's children.
	 * @param {string[]} [array=[]] The array to push.
	 * @returns {string[]}
	 */
    getValues(array = []) {
        return this._keys.map(key => this[key].getValues(array));
    }

    /**
	 * Get a list.
	 * @param {external:Message} msg The Message instance.
	 * @param {Object} object The settings to parse.
	 * @returns {string}
	 */
    getList(msg, object) {
        const array = [];
        if (this._keys.length === 0) return '';
        const keys = this._keys.filter(key => this[key].type === 'Folder' || this[key].configurable).sort();
        const longest = keys.reduce((a, b) => a.length > b.length ? a : b).length;
        for (let i = 0; i < keys.length; i++)
            array.push(`${keys[i].padEnd(longest)} :: ${Schema.resolveString(msg, this[keys[i]], object[keys[i]])}`);

        return array.join('\n');
    }

    /**
	 * Resolve a string.
	 * @param {external:Message} msg The Message to use.
	 * @param {SchemaPiece} path The SchemaPiece instance.
	 * @param {any} value The current value of the key.
	 * @returns {string}
	 */
    static resolveString(msg, path, value) {
        let resolver = (val) => val;
        switch (path.type) {
            case 'Folder': resolver = () => '[ Folder';
                break;
            case 'user': resolver = (val) => (this.client.users.get(val) || { username: val }).username;
                break;
            case 'textchannel':
            case 'voicechannel':
            case 'channel': resolver = (val) => `#${(msg.guild.channels.get(val) || { name: val }).name}`;
                break;
            case 'role': resolver = (val) => `@${(msg.guild.roles.get(val) || { name: val }).name}`;
                break;
            case 'guild': resolver = (val) => val.name;
                break;
            // no default
        }

        return path.array ? value.length > 0 ? `[ ${value.map(resolver).join(' | ')} ]` : 'None' : value === null ? 'Not set' : resolver(value);
    }

    _patch(object) {
        for (const key of Object.keys(object)) {
            if (typeof object[key] !== 'object') continue;
            if (object[key].type === 'Folder') {
                const folder = new Schema(this.client, this.manager, object[key], `${this.path === '' ? '' : `${this.path}.`}${key}`);
                this[key] = folder;
                this.defaults[key] = folder.defaults;
            } else {
                const piece = new SchemaPiece(this.client, this.manager, object[key], `${this.path === '' ? '' : `${this.path}.`}${key}`, key);
                this[key] = piece;
                this.defaults[key] = piece.default;
            }
            this.keys.add(key);
            this._keys.push(key);
        }
    }

    /**
	 * @returns {string}
	 */
    toString() {
        return this._keys.length > 1 ? '[ Folder' : '[ Empty Folder';
    }

}

module.exports = Schema;
