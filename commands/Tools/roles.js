const { Command, RichDisplay } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			// Disabled until Klasa fixes the Usage error
			enabled: false,
			botPerms: ['MANAGE_ROLES'],
			cooldown: 5,
			description: msg => msg.language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_ROLES_EXTENDED'),
			runIn: ['text'],
			usage: '[roles:rolename] [...]',
			usageDelim: ','
		});
	}

	async run(msg, roles) {
		const { public: publicRoles, removeInitial, initial } = msg.guild.configs.roles.public;
		if (!publicRoles.length) throw msg.language.get('COMMAND_ROLES_LIST_EMPTY');

		if (!roles.length) return this.list(msg, publicRoles);
		const memberRoles = new Set(msg.member.roles.keys());
		const filterRoles = new Set(roles);
		const unlistedRoles = [], unmanageable = [], addedRoles = [], removedRoles = [];
		const { position } = msg.guild.me.roles.highest;

		for (const role of filterRoles) {
			if (!publicRoles.includes(role.id)) {
				unlistedRoles.push(role.name);
			} else if (position <= role.position) {
				unmanageable.push(role.name);
			} else if (memberRoles.has(role.id)) {
				memberRoles.delete(role.id);
				removedRoles.push(role.name);
			} else {
				memberRoles.add(role.id);
				addedRoles.push(role.name);
			}
		}

		// If the guild requests to remove the initial role upon claiming, remove the initial role
		if (initial && removeInitial && addedRoles.length) {
			// If the role was deleted, remove it from the configs
			if (!msg.guild.roles.has(initial)) msg.guild.configs.reset('roles.initial').catch(error => this.client.emit('wtf', error));
			else if (msg.member.roles.has(initial)) removedRoles.add(initial);
		}

		// Apply the roles
		if (removedRoles.length || addedRoles.length) await msg.member.roles.set([...memberRoles], msg.language.get('COMMAND_ROLES_AUDITLOG'));

		const output = [];
		if (unlistedRoles.length) output.push(msg.language.get('COMMAND_ROLES_NOT_PUBLIC', unlistedRoles.join('`, `')));
		if (unmanageable.length) output.push(msg.language.get('COMMAND_ROLES_NOT_MANAGEABLE', unmanageable.join('`, `')));
		if (removedRoles.length) output.push(msg.language.get('COMMAND_ROLES_REMOVED', removedRoles.join('`, `')));
		if (addedRoles.length) output.push(msg.language.get('COMMAND_ROLES_ADDED', addedRoles.join('`, `')));
		return msg.sendMessage(output.join('\n'));
	}

	async list(msg, publicRoles) {
		const remove = [], roles = [];
		for (const roleID of publicRoles) {
			const role = msg.guild.roles.get(roleID);
			if (role) roles.push(role.name);
			else remove.push(roleID);
		}

		// Automatic role deletion
		if (remove.length) {
			const allRoles = new Set(publicRoles);
			for (const role of remove) allRoles.delete(role);
			await msg.guild.configs.update({ roles: { public: [...allRoles] } });
		}

		// There's the possibility all roles could be inexistent, therefore the system
		// would filter and remove them all, causing this to be empty.
		if (!roles.length) throw msg.language.get('COMMAND_ROLES_LIST_EMPTY');

		const display = new RichDisplay(new this.client.methods.Embed()
			.setColor(msg.member.roles)
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setTitle(msg.language.get('COMMAND_ROLES_LIST_TITLE'))
		);

		const pages = Math.ceil(roles.length / 10);
		for (let i = 0; i < pages; i++) display.addPage(template => template.setDescription(roles.slice(i * 10, 10)));

		return display.run(await msg.sendMessage(msg.language.get('SYSTEM_PROCESSING')), { filter: (reaction, user) => user === msg.author });
	}

};
