const { Command, klasaUtil: { codeBlock } } = require('../../../index');

const REG_REAC = /^<(:[^:]+:\d{17,19})>$/;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			requiredPermissions: ['READ_MESSAGE_HISTORY', 'ADD_REACTIONS'],
			bucket: 2,
			cooldown: 10,
			description: (msg) => msg.language.get('COMMAND_MANAGEROLEREACTION_DESCRIPTION'),
			extendedHelp: (msg) => msg.language.get('COMMAND_MANAGEROLEREACTION_EXTENDED'),
			permissionLevel: 6,
			runIn: ['text'],
			usage: '<show|add|remove|reset> (role:rolename) (emoji:emoji)',
			usageDelim: ' ',
			quotedStringSupport: true,
			subcommands: true
		});

		this.createCustomResolver('emoji', async (arg, possible, msg, [action = 'show']) => {
			if (action === 'show' || action === 'reset') return undefined;
			if (!arg) throw msg.language.get('COMMAND_MANAGEROLEREACTION_REQUIRED_REACTION');

			try {
				if (REG_REAC.test(arg)) [, arg] = REG_REAC.exec(arg);
				await msg.react(arg);
				return arg;
			} catch (_) {
				throw msg.language.get('COMMAND_TRIGGERS_INVALIDREACTION');
			}
		}).createCustomResolver('rolename', (arg, possible, msg, [action = 'show']) => {
			if (action !== 'add') return undefined;
			if (!arg) throw msg.language.get('COMMAND_MANAGEROLEREACTION_REQUIRED_ROLE');
			return this.client.arguments.get('rolename').run(arg, possible, msg);
		});
	}

	async show(msg) {
		const list = new Set(msg.guild.configs.roles.reactions);
		const oldLength = list.size;
		if (!list.size) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const lines = [];
		for (const entry of list) {
			const role = msg.guild.roles.get(entry.role);
			if (!role) list.delete(entry);
			else lines.push(`${role.name.padEnd(25, ' ')} :: ${entry.emoji}`);
		}
		if (oldLength !== list.size) msg.guild.configs.update('roles.reactions', [...list]);
		if (!lines.length) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		return msg.sendMessage(codeBlock('asciicode', lines.join('\n')));
	}

	async add(msg, [role, reaction]) {
		if (this._checkRoleReaction(msg, reaction, role.id)) throw msg.language.get('COMMAND_MANAGEROLEREACTION_EXISTS');
		const { errors } = await msg.guild.configs.update('roles.reactions', [...msg.guild.configs.roles.reactions, { emoji: reaction, role: role.id }]);
		if (errors.length) throw errors[0];
		await this._reactMessage(msg.guild.configs.channels.roles, msg.guild.configs.roles.messageReaction, reaction);
		return msg.sendLocale('COMMAND_MANAGEROLEREACTION_ADD');
	}

	async remove(msg, [, reaction]) {
		const list = msg.guild.configs.roles.reactions;
		if (!list.length) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const entry = list.find(en => en.emoji === reaction);
		if (!entry) throw msg.language.get('COMMAND_MANAGEROLEREACTION_REMOVE_NOTEXISTS');
		const { errors } = await msg.guild.configs.update('roles.reactions', entry, { action: 'remove' });
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_MANAGEROLEREACTION_REMOVE');
	}

	async reset(msg) {
		if (!msg.guild.configs.roles.reactions.length) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const { errors } = await msg.guild.configs.reset('roles.reactions');
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_MANAGEROLEREACTION_RESET');
	}

	_reactMessage(channelID, messageID, reaction) {
		return this.client.api.channels[channelID].messages[messageID].reactions[this.client.emojis.resolveIdentifier(reaction)]['@me'].put();
	}

	_checkRoleReaction(msg, reaction, role) {
		const list = msg.guild.configs.roles.reactions;
		if (list.length) for (const entry of list) if (entry.emoji === reaction || entry.role === role) return true;
		return false;
	}

};
