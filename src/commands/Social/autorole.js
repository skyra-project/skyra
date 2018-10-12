const { Command } = require('../../index');
const SORT = (x, y) => +(x.points > y.points) || +(x.points === y.points) - 1;

/* eslint-disable max-len */
module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['autoroles', 'levelrole', 'lvlrole'],
			requiredPermissions: ['MANAGE_ROLES'],
			cooldown: 10,
			description: (language) => language.get('COMMAND_AUTOROLE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_AUTOROLE_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			subcommands: true,
			usage: '<add|remove|update|show:default> (role:rolename) [points:points{0,1000000}]',
			usageDelim: ' '
		});

		this.createCustomResolver('rolename', (arg, possible, msg, [type]) => {
			if (type === 'show') return undefined;
			return this.client.arguments.get('rolename').run(arg, possible, msg);
		}).createCustomResolver('points', (arg, possible, msg, [type]) => {
			if (type === 'show' || type === 'remove') return undefined;
			return this.client.arguments.get('integer').run(arg, possible, msg);
		});
	}

	async show(msg) {
		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length) throw msg.language.get('COMMAND_AUTOROLE_LIST_EMPTY');

		const filtered = new Set(autoRoles);
		const output = [];
		for (const obj of autoRoles) {
			const role = msg.guild.roles.get(obj.id);
			if (role) output.push(`${obj.points.toString().padStart(6, ' ')} : ${role.name}`);
			else filtered.delete(obj);
		}

		if (filtered.size !== autoRoles.length) await msg.guild.settings.update('roles.auto', [...filtered], { action: 'overwrite' });
		if (!output.length) throw msg.language.get('COMMAND_AUTOROLE_LIST_EMPTY');
		return msg.sendMessage(output.join('\n'), { code: 'http' });
	}

	async add(msg, [role, points]) {
		if (typeof points === 'undefined') throw msg.language.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (typeof role === 'undefined') throw msg.language.get('REQUIRE_ROLE');

		const autoRoles = msg.guild.settings.roles.auto;
		if (autoRoles.length && autoRoles.some(entry => entry.id === role.id))
			throw msg.language.get('COMMAND_AUTOROLE_UPDATE_CONFIGURED');

		await msg.guild.settings.update('roles.auto', [...autoRoles, { id: role.id, points }].sort(SORT), { action: 'overwrite' });
		return msg.sendLocale('COMMAND_AUTOROLE_ADD', [role, points]);
	}

	async remove(msg, [role]) {
		if (typeof role === 'undefined') throw msg.language.get('REQUIRE_ROLE');

		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length || !autoRoles.some(entry => entry.id === role.id))
			throw msg.language.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');

		const deleteEntry = autoRoles.find(entry => entry.id === role.id);
		await msg.guild.settings.update('roles.auto', deleteEntry, { action: 'delete' });

		return msg.sendLocale('COMMAND_AUTOROLE_REMOVE', [role, deleteEntry.points]);
	}

	async update(msg, [role, points]) {
		if (typeof points === 'undefined') throw msg.language.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (typeof role === 'undefined') throw msg.language.get('REQUIRE_ROLE');

		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length || !autoRoles.some(entry => entry.id === role.id))
			throw msg.language.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');

		const autoRole = autoRoles.find(entry => entry.id === role.id);
		autoRole.points = points;
		await msg.guild.settings.update('roles.auto', [...autoRoles].sort(SORT), { action: 'overwrite' });
		return msg.sendLocale('COMMAND_AUTOROLE_UPDATE', [role, points, autoRole]);
	}

};
