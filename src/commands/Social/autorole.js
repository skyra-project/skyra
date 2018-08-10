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
			usage: '<list|add|remove|update> [points:integer{0,1000000}] [role:rolename]',
			usageDelim: ' '
		});
	}

	async list(msg) {
		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length) throw msg.language.get('COMMAND_AUTOROLE_LIST_EMPTY');

		const filtered = new Set(autoRoles);
		const output = [];
		for (const obj of autoRoles) {
			const role = msg.guild.roles.get(obj.id);
			if (role) output.push(`${obj.points.toString().padStart(6, ' ')} : ${role.name}`);
			else filtered.delete(obj);
		}

		if (filtered.size !== autoRoles.length) await msg.guild.settings.update('roles.auto', [...filtered]);
		if (!output.length) throw msg.language.get('COMMAND_AUTOROLE_LIST_EMPTY');
		return msg.sendMessage(output.join('\n'), { code: 'http' });
	}

	async add(msg, [points, role]) {
		if (typeof points === 'undefined') throw msg.language.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (typeof role === 'undefined') throw msg.language.get('REQUIRE_ROLE');

		const autoRoles = msg.guild.settings.roles.auto;
		if (autoRoles.length && autoRoles.some(entry => entry.id === role.id))
			throw msg.language.get('COMMAND_AUTOROLE_UPDATE_CONFIGURED');


		await msg.guild.settings.update('roles.auto', [...autoRoles, { id: role.id, points }].sort(SORT));
		return msg.sendLocale('COMMAND_AUTOROLE_ADD', [role, points]);
	}

	async remove(msg, [, role]) {
		if (typeof role === 'undefined') throw msg.language.get('REQUIRE_ROLE');

		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length || !autoRoles.some(entry => entry.id === role.id))
			throw msg.language.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');


		const deleteEntry = autoRoles.find(entry => entry.id === role.id);
		await msg.guild.settings.update('roles.auto', deleteEntry, { action: 'delete' });

		return msg.sendLocale('COMMAND_AUTOROLE_REMOVE', [role, deleteEntry.points]);
	}

	async update(msg, [points, role]) {
		if (typeof points === 'undefined') throw msg.language.get('COMMAND_AUTOROLE_POINTS_REQUIRED');
		if (typeof roles === 'undefined') throw msg.language.get('REQUIRE_ROLE');

		const autoRoles = msg.guild.settings.roles.auto;
		if (!autoRoles.length || !autoRoles.some(entry => entry.id === role.id))
			throw msg.language.get('COMMAND_AUTOROLE_UPDATE_UNCONFIGURED');


		const autoRole = autoRoles.find(entry => entry.id === role.id);
		autoRole.points = points;
		await msg.guild.settings.update('roles.auto', [...autoRoles].sort(SORT));
		return msg.sendLocale('COMMAND_AUTOROLE_UPDATE', [role, points, autoRole]);
	}

};
