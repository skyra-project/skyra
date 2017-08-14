const Resolver = require('./SettingResolver');
const { Guild } = require('discord.js');
const SchemaJSON = require('../../schema.json');

class SettingGateway {

    constructor(client) {
        this.client = client;
        this.resolver = new Resolver(client);
        this.schema = {};
        this.defaults = {};
    }

    async init() {
        const schema = SchemaJSON;

        for (const [key, value] of Object.entries(schema)) {
            this.schema[key] = {};
            this.defaults[key] = {};
            for (const [subkey, subvalue] of Object.entries(value)) {
                if ('array' in subvalue === false) subvalue.array = false;
                if ('default' in subvalue === false) subvalue.default = null;
                if ('min' in subvalue === false) subvalue.min = null;
                if ('max' in subvalue === false) subvalue.max = null;
                this.schema[key][subkey] = subvalue;
                this.defaults[key][subkey] = subvalue.default;
            }
        }
    }

    /**
     * @param {(Guild|string)} guild The guild to resolve
     * @returns {Guild}
     */
    validate(guild) {
        if (guild instanceof Guild) return guild;
        if (typeof guild === 'string' && /^\d{17,19}$/.test(guild)) return this.client.guilds.get(guild) || null;
        return null;
    }

    async update(guild, object) {
        const target = await this.validate(guild);

        const keys = [];
        const values = {};

        for (const [key, value] of Object.entries(object)) {
            if (key in this.schema === false) throw `The key ${key} does not exist in the current schema.`;

            values[key] = {};
            for (const [subkey, subvalue] of Object.entries(value)) {
                if (subkey in this.schema[key] === false) throw `The key ${key}::${subkey} does not exist in the current schema.`;
                keys.push(
                    this.resolver[this.schema[key][subkey].type.toLowerCase()](subvalue, target, this.schema[key][subkey])
                        .then((res) => { values[key][subkey] = res.id || res; })
                );
            }
        }

        await Promise.all(keys);
        await target.settings.update(values);

        return values;
    }

    async updateArray(guild, type, key, subkey, data) {
        if (['add', 'remove'].includes(type) === false) throw 'The type parameter must be either add or remove.';
        if (key in this.schema === false) throw `The key ${key} does not exist in the current data schema.`;
        if (subkey in this.schema[key] === false) throw `The key ${key}::${subkey} does not exist in the current schema.`;
        if (this.schema[key][subkey].array) throw `The key ${key}::${subkey} is not an Array.`;
        if (!data || ((typeof data === 'string' || Array.isArray(data)) && data.length === 0)) throw 'You must specify the value to add or filter.';

        const schema = this.schema[key][subkey];

        const target = await this.validate(guild);
        const result = await this.resolver[schema.type.toLowerCase()](data, target, schema)
            .then(res => res.id || res);

        let settings = target.settings;
        if (settings instanceof Promise) settings = await settings;
        let values = settings[key][subkey];

        if (type === 'add') {
            if (values.includes(result)) throw `The value ${data} for the key ${key}::${subkey} already exists.`;
            values.push(result);
            await settings.update({ [key]: { [subkey]: values } });
            return result;
        }

        if (values.includes(result) === false) throw `The value ${data} for the key ${key}::${subkey} does not exist.`;
        values = values.filter(res => res !== result);

        await settings.update({ [key]: { [subkey]: values } });
        return true;
    }

    async reset(guild, key, subkey) {
        if (key in this.schema === false) throw `The key ${key} does not exist in the current data schema.`;
        if (subkey in this.schema[key] === false) throw `The key ${key}::${subkey} does not exist in the current schema.`;

        const target = await this.validate(guild);
        const defaultKey = this.schema[key][subkey].default;

        await target.settings.update({ [key]: { [subkey]: defaultKey } });
        return defaultKey;
    }

}

module.exports = SettingGateway;
