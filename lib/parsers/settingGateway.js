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
            if (key in this.schema === false) throw ['SETTING_GATEWAY_FOLDER_NOTEXISTS', key];

            const schema = this.schema[key];

            values[key] = {};
            for (const [subkey, subvalue] of Object.entries(value)) {
                if (subkey in schema === false) throw ['SETTING_GATEWAY_KEY_NOTEXISTS', key, subkey];

                const { type, min, max } = schema[subkey];

                keys.push(
                    this.resolver[type.toLowerCase()](subvalue, target, subkey, { min, max })
                        .then((res) => { values[key][subkey] = res.id || res; })
                );
            }
        }

        await Promise.all(keys).catch((err) => { throw err; });
        await target.settings.update(values);

        return values;
    }

    async updateArray(guild, type, key, subkey, data) {
        if (['add', 'remove'].includes(type) === false)
            throw ['SETTING_GATEWAY_ADD_OR_REMOVE'];
        if (key in this.schema === false)
            throw ['SETTING_GATEWAY_FOLDER_NOTEXISTS', key];
        if (subkey in this.schema[key] === false)
            throw ['SETTING_GATEWAY_KEY_NOTEXISTS', key, subkey];
        if (this.schema[key][subkey].array !== true)
            throw ['SETTING_GATEWAY_NOT_ARRAY', key, subkey];

        if (!data || ((typeof data === 'string' || Array.isArray(data)) && data.length === 0))
            throw ['SETTING_GATEWAY_REQUIRE_VALUE'];

        const schema = this.schema[key][subkey];

        const target = await this.validate(guild);
        const result = await this.resolver[schema.type.toLowerCase()](data, target, subkey, { min: schema.min, max: schema.max })
            .then(res => res.id || res);

        let settings = target.settings;
        if (settings instanceof Promise) settings = await settings;
        let values = settings[key][subkey];

        if (type === 'add') {
            if (values.includes(result))
                throw ['SETTING_GATEWAY_ARRAY_ADD_EXISTS', key, subkey, data];
            values.push(result);
            await settings.update({ [key]: { [subkey]: values } });
            return result;
        }

        if (values.includes(result) === false)
            throw ['SETTING_GATEWAY_ARRAY_REMOVE_NOTEXISTS', key, subkey, data];
        values = values.filter(res => res !== result);

        await settings.update({ [key]: { [subkey]: values } });
        return true;
    }

    async reset(guild, key, subkey) {
        if (key in this.schema === false)
            throw ['SETTING_GATEWAY_FOLDER_NOTEXISTS', key];
        if (subkey in this.schema[key] === false)
            throw ['SETTING_GATEWAY_KEY_NOTEXISTS', key, subkey];

        const target = await this.validate(guild);
        const defaultKey = this.schema[key][subkey].default;

        await target.settings.update({ [key]: { [subkey]: defaultKey } });
        return defaultKey;
    }

}

module.exports = SettingGateway;
