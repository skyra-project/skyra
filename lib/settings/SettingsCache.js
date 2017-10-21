const Gateway = require('./Gateway');
const SettingResolver = require('../parsers/SettingResolver');
const rethinkProvider = require('../../providers/rethink');
const expandedCollection = require('../../providers/collection');

/**
 * Gateway's driver to make new instances of it, with the purpose to handle different databases simultaneously.
 */
class SettingsCache {

    /**
	 * @param {Client} client The Discord client
	 */
    constructor(client) {
        /**
		 * The client this SettingsCache was created with.
		 * @type {Client}
		 * @readonly
		 */
        Object.defineProperty(this, 'client', { value: client });

        /**
		 * The resolver instance this Gateway uses to parse the data.
		 * @type {SettingResolver}
		 */
        this.resolver = new SettingResolver(client);

        /**
		 * All the types accepted for the Gateway.
		 * @type {string[]}
		 */
        this.types = Object.getOwnPropertyNames(SettingResolver.prototype).slice(1);
    }

    /**
	 * Add a new instance of SettingGateway, with its own validateFunction and schema.
	 * @param {string} name The name for the new instance.
	 * @param {Object} [schema={}] The schema.
	 * @param {string} [options={}] A provider to use. If not specified it'll use the one in the client.
	 * @returns {Gateway}
	 */
    async add(name, schema = {}, options = {}) {
        if (typeof name !== 'string') throw 'You must pass a name for your new gateway and it must be a string.';
        if (typeof this[name] !== 'undefined') throw 'There is already a Gateway with that name.';
        if (schema.constructor.name !== 'Object') throw 'Schema must be a valid object or left undefined for an empty object.';

        options.provider = rethinkProvider;
        options.cache = expandedCollection;

        this[name] = new Gateway(this, name, schema, options);
        await this[name].init();
        return this[name];
    }

    _checkProvider(engine) {
        const provider = this.client.providers.get(engine);
        if (!provider) throw `This provider (${engine}) does not exist in your system.`;

        return provider;
    }

}

module.exports = SettingsCache;
