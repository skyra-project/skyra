const { Command } = require('../../../index');

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_MANAGEROLEREACTION_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MANAGEROLEREACTION_EXTENDED'),
			// permissionLevel: 6,
			// TODO: FIX LAZYNESS
			permissionLevel: 10,
			runIn: ['text'],
			usage: '<show|add|remove|reset> (user:username) (role:rolename)',
			usageDelim: ' ',
			quotedStringSupport: true,
			subcommands: true
		});

		this.createCustomResolver('username', (arg, possible, msg) => {
			if (!arg) throw msg.language.get('COMMAND_STICKYROLES_REQUIRED_USER');
			return this.client.arguments.get('username').run(arg, possible, msg);
		}).createCustomResolver('rolename', (arg, possible, msg, [action]) => {
			if (action === 'reset' || action === 'show') return undefined;
			if (!arg) throw msg.language.get('COMMAND_STICKYROLES_REQUIRED_ROLE');
			return this.client.arguments.get('rolename').run(arg, possible, msg);
		});
	}

	/* eslint-disable */
	public reset(msg, [user, role]) { }

	public remove(msg, [user, role]) { }

	public add(msg, [user, role]) { }
	/* eslint-enable */

	public async show(msg, [user]) {
		let all = msg.guild.settings.stickyRoles;
		if (user) all = [all.find((stickyRole) => stickyRole.id === user.id)];

		if (!all.length) throw msg.language.get('COMMAND_STICKYROLES_SHOW_EMPTY');

		const output = [];
		await Promise.all(all.map(async(stickyRole) => {
			const roles = [];
			for (const role of stickyRole.roles) {
				const resolved = msg.guild.roles.get(role);
				if (resolved) roles.push(resolved.name);
			}
			if (roles.length) output.push(await msg.guild.fetchName(stickyRole.id) || `<@${stickyRole.id}>`, roles.join(', '));
		}));

		if (!output.length) {
			await msg.guild.settings.update('stickyRoles', msg.guild.settings.stickyRoles.filter((stickyRole) => all.includes(stickyRole)));
			throw msg.language.get('COMMAND_STICKYROLES_SHOW_EMPTY');
		}

		return msg.sendLocale('COMMAND_STICKYROLES_SHOW', [output.join('\n')]);
	}

};
