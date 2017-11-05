const { structures: { Command } } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			guildOnly: true,
			aliases: ['conf', 'config'],
			permLevel: 3,
			description: 'Define per-server configuration.',
			usage: '<set|get|reset|list|remove> [key:string] [value:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [action, key = '', ...value], settings, i18n) {
		if (['set', 'reset', 'remove'].includes(action) && key === '') throw i18n.get('COMMAND_CONF_NOKEY');
		if (['set', 'remove'].includes(action) && value.length === 0) throw i18n.get('COMMAND_CONF_NOVALUE');
		value = value.length > 0 ? value.join(' ') : null;
		return this[action](msg, settings, key, value, i18n);
	}

	async set(msg, settings, key, valueToSet, i18n) {
		const { path, value } = await this.client.settings.guilds.updateOne(msg.guild, key, valueToSet, true);
		if (path.array) return msg.send(i18n.get('COMMAND_CONF_ADDED', path.toString(value), path.path));
		return msg.send(i18n.get('COMMAND_CONF_UPDATED', path.path, path.toString(value)));
	}

	async remove(msg, settings, key, valueToRemove, i18n) {
		const { path, value } = await this.client.settings.guilds.updateArray(msg.guild, 'remove', key, valueToRemove, true);
		return msg.send(i18n.get('COMMAND_CONF_REMOVE', path.toString(value), path.path));
	}

	async get(msg, settings, key, _value, i18n) {
		const { path } = this.client.settings.guilds.getPath(key, { avoidUnconfigurable: true });
		const settingPath = key.split('.');
		let value = settings;
		for (let i = 0; i < settingPath.length; i++) value = value[settingPath[i]];
		return msg.send(i18n.get('COMMAND_CONF_GET', path.path, path.toString(value)));
	}

	async reset(msg, settings, key, _value, i18n) {
		const { path, value } = await this.client.settings.guilds.reset(msg.guild, key, true);
		return msg.send(i18n.get('COMMAND_CONF_RESET', path.path, path.toString(value)));
	}

	list(msg, settings, key, _value, i18n) {
		const { path, route } = this.client.settings.guilds.getPath(key, { avoidUnconfigurable: true, piece: false });
		let object = settings;
		if (route.length >= 1) {
			for (let i = 0; i < route.length; i++) object = object[route[i]];
		}
		const message = path.getList(msg, object);
		return msg.send(`${i18n.get('COMMAND_CONF_LIST_TITLE')}\n${message}`, { code: 'asciidoc' });
	}

	handle(value) {
		if (typeof value !== 'object') return value;
		if (value === null) return 'Not set';
		if (value instanceof Array) return value[0] ? `[ ${value.join(' | ')} ]` : 'None';
		return value;
	}

};
