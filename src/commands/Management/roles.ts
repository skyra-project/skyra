const { Command, RichDisplay, constants: { TIME }, MessageEmbed, FuzzySearch } = require('../../index');
const RH_TIMELIMIT = TIME.MINUTE * 5;

module.exports = class extends Command {

	public constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_ROLES_EXTENDED'),
			runIn: ['text'],
			usage: '(roles:rolenames)'
		});

		this.createCustomResolver('rolenames', async(arg, possible, msg) => {
			if (!msg.guild.settings.roles.public.length) throw msg.language.get('COMMAND_ROLES_LIST_EMPTY');
			if (!arg) return [];

			const search = new FuzzySearch(msg.guild.roles, (role) => role.name, (role) => msg.guild.settings.roles.public.includes(role.id));
			const roles = arg.split(',').map((role) => role.trim()).filter((role) => role.length);
			const output = [];
			for (const role of roles) {
				const result = await search.run(msg, role);
				if (result) output.push(result[1]);
			}
			return output.length ? [...new Set(output)] : output;
		});
	}

	public async run(msg, [roles]) {
		const { public: publicRoles, removeInitial, initial } = msg.guild.settings.roles;
		if (!publicRoles.length) throw msg.language.get('COMMAND_ROLES_LIST_EMPTY');

		if (!roles.length) return this.list(msg, publicRoles);
		const memberRoles = new Set(msg.member.roles.keys());
		const filterRoles = new Set(roles);
		const unlistedRoles = [], unmanageable = [], addedRoles = [], removedRoles = [];
		const { position } = msg.guild.me.roles.highest;

		for (const role of filterRoles) {
			if (!role) continue;
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
			// If the role was deleted, remove it from the settings
			if (!msg.guild.roles.has(initial)) msg.guild.settings.reset('roles.initial').catch((error) => this.client.emit('wtf', error));
			else if (msg.member.roles.has(initial)) memberRoles.delete(initial);
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

	public async list(msg, publicRoles) {
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
			await msg.guild.settings.update('roles.public', [...allRoles], { action: 'overwrite', force: true });
		}

		// There's the possibility all roles could be inexistent, therefore the system
		// would filter and remove them all, causing this to be empty.
		if (!roles.length) throw msg.language.get('COMMAND_ROLES_LIST_EMPTY');

		const display = new RichDisplay(new MessageEmbed()
			.setColor(msg.member.displayColor)
			.setAuthor(this.client.user.username, this.client.user.displayAvatarURL())
			.setTitle(msg.language.get('COMMAND_ROLES_LIST_TITLE'))
		);

		const pages = Math.ceil(roles.length / 10);
		for (let i = 0; i < pages; i++) display.addPage((template) => template.setDescription(roles.slice(i * 10, (i * 10) + 10)));

		return display.run(await msg.channel.send(msg.language.get('SYSTEM_PROCESSING')), { filter: (reaction, user) => user === msg.author, time: RH_TIMELIMIT });
	}

};
