const { Command } = require('../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			botPerms: ['MANAGE_ROLES'],
			cooldown: 5,
			description: msg => msg.language.get('COMMAND_ROLES_DESCRIPTION'),
			extendedHelp: msg => msg.language.get('COMMAND_ROLES_EXTENDED'),
			runIn: ['text'],
			usage: '[list|claim|unclaim] [roles:string] [...]',
			usageDelim: ' '
		});
	}

	async run(msg, [action = 'list', ...input]) {
		if (action === 'list') return this.list(msg);
		if (!input[0]) throw 'write `Skyra, roles list` to get a list of all roles, or `Skyra, roles claim <role1, role2, ...>` to claim them.';
		const roles = input.join(' ').split(/, */).map(entry => entry.trimRight());
		return this[action](msg, roles);
	}

	async claim(msg, roles) {
		const message = [];
		if (msg.guild.configs.roles.initial && msg.guild.configs.roles.removeInitial && msg.member.roles.has(msg.guild.configs.roles.initial))
			await msg.member.removeRole(msg.guild.configs.roles.initial);

		const { giveRoles, unlistedRoles, existentRoles, invalidRoles } = await this.roleAddCheck(msg, roles);
		if (existentRoles) message.push(msg.language.get('COMMAND_ROLES_CLAIM_EXISTENT', existentRoles.join('`, `')));
		if (unlistedRoles) message.push(msg.language.get('COMMAND_ROLES_NOT_PUBLIC', unlistedRoles.join('`, `')));
		if (invalidRoles) message.push(msg.language.get('COMMAND_ROLES_NOT_FOUND', invalidRoles.join('`, `')));
		if (giveRoles) {
			if (giveRoles.length === 1) await msg.member.addRole(giveRoles[0]).catch(Command.handleError);
			else await msg.member.addRoles(giveRoles).catch(Command.handleError);
			message.push(msg.language.get('COMMAND_ROLES_CLAIM_GIVEN', giveRoles.map(role => role.name).join('`, `')));
		}

		return msg.sendMessage(message.join('\n'));
	}

	async unclaim(msg, roles) {
		const message = [];
		const { removeRoles, unlistedRoles, nonexistentRoles, invalidRoles } = await this.roleRemoveCheck(msg, roles);
		if (nonexistentRoles) message.push(msg.language.get('COMMAND_ROLES_UNCLAIM_UNEXISTENT', nonexistentRoles.join('`, `')));
		if (unlistedRoles) message.push(msg.language.get('COMMAND_ROLES_NOT_PUBLIC', unlistedRoles.join('`, `')));
		if (invalidRoles) message.push(msg.language.get('COMMAND_ROLES_NOT_FOUND', invalidRoles.join('`, `')));
		if (removeRoles) {
			if (removeRoles.length === 1) await msg.member.removeRole(removeRoles[0]).catch(Command.handleError);
			else await msg.member.removeRoles(removeRoles).catch(Command.handleError);
			message.push(msg.language.get('COMMAND_ROLES_UNCLAIM_REMOVED', removeRoles.map(role => role.name).join('`, `')));
		}

		return msg.sendMessage(message.join('\n'));
	}

	async roleAddCheck(msg, roles) {
		const giveRoles = [];
		const existentRoles = [];
		const unlistedRoles = [];
		const invalidRoles = [];
		for (const role of roles) {
			if (role.length === 0) continue;
			const res = await this.client.handler.search.role(role, msg);

			if (res === null) invalidRoles.push(role);
			else if (!msg.guild.configs.roles.public.includes(res.id)) unlistedRoles.push(res.name);
			else if (msg.member.roles.has(res.id)) existentRoles.push(res.name);
			else giveRoles.push(res);
		}

		return {
			giveRoles: giveRoles.length ? giveRoles : null,
			unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
			existentRoles: existentRoles.length ? existentRoles : null,
			invalidRoles: invalidRoles.length ? invalidRoles : null
		};
	}

	async roleRemoveCheck(msg, roles) {
		const removeRoles = [];
		const nonexistentRoles = [];
		const unlistedRoles = [];
		const invalidRoles = [];
		for (const role of roles) {
			if (role.length === 0) continue;
			const res = await this.client.handler.search.role(role, msg);

			if (res === null) invalidRoles.push(role);
			else if (!msg.guild.configs.roles.public.includes(res.id)) unlistedRoles.push(res.name);
			else if (!msg.member.roles.has(res.id)) nonexistentRoles.push(res.name);
			else removeRoles.push(res);
		}

		return {
			removeRoles: removeRoles.length ? removeRoles : null,
			unlistedRoles: unlistedRoles.length ? unlistedRoles : null,
			nonexistentRoles: nonexistentRoles.length ? nonexistentRoles : null,
			invalidRoles: invalidRoles.length ? invalidRoles : null
		};
	}

	list(msg) {
		if (msg.guild.configs.roles.public.length === 0)
			throw msg.language.get('COMMAND_ROLES_LIST_EMPTY');

		const theRoles = msg.guild.configs.roles.public.map(entry => msg.guild.roles.has(entry) ? msg.guild.roles.get(entry).name : entry);

		const embed = new this.client.methods.Embed()
			.setColor(msg.color)
			.setTitle(msg.language.get('COMMAND_ROLES_LIST_TITLE', msg.guild))
			.setDescription(theRoles.join('\n'));
		return msg.sendMessage({ embed });
	}

};
