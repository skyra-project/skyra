const { Command, klasaUtil: { codeBlock }, util: { resolveEmoji } } = require('../../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['READ_MESSAGE_HISTORY', 'ADD_REACTIONS'],
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get('COMMAND_MANAGEROLEREACTION_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_MANAGEROLEREACTION_EXTENDED'),
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
				arg = resolveEmoji(arg);
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
		const list = new Set(msg.guild.settings.roles.reactions);
		const oldLength = list.size;
		if (!list.size) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const lines = [];
		for (const entry of list) {
			const role = msg.guild.roles.get(entry.role);
			if (!role) list.delete(entry);
			else lines.push(`${role.name.padEnd(25, ' ')} :: ${entry.emoji}`);
		}
		if (oldLength !== list.size) msg.guild.settings.update('roles.reactions', [...list], { action: 'overwrite' });
		if (!lines.length) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		return msg.sendMessage(codeBlock('asciicode', lines.join('\n')));
	}

	async add(msg, [role, reaction]) {
		if (this._checkRoleReaction(msg, reaction, role.id)) throw msg.language.get('COMMAND_MANAGEROLEREACTION_EXISTS');
		const { errors } = await msg.guild.settings.update('roles.reactions', { emoji: reaction, role: role.id }, { action: 'add' });
		if (errors.length) throw errors[0];
		if (msg.guild.settings.roles.messageReaction)
			await this._reactMessage(msg.guild.settings.channels.roles, msg.guild.settings.roles.messageReaction, reaction);
		return msg.sendLocale('COMMAND_MANAGEROLEREACTION_ADD');
	}

	async remove(msg, [, reaction]) {
		const list = msg.guild.settings.roles.reactions;
		if (!list.length) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const entry = list.find(en => en.emoji === reaction);
		if (!entry) throw msg.language.get('COMMAND_MANAGEROLEREACTION_REMOVE_NOTEXISTS');
		const { errors } = await msg.guild.settings.update('roles.reactions', entry, { action: 'remove' });
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_MANAGEROLEREACTION_REMOVE');
	}

	async reset(msg) {
		if (!msg.guild.settings.roles.reactions.length) throw msg.language.get('COMMAND_MANAGEROLEREACTION_LIST_EMPTY');
		const { errors } = await msg.guild.settings.reset('roles.reactions');
		if (errors.length) throw errors[0];
		return msg.sendLocale('COMMAND_MANAGEROLEREACTION_RESET');
	}

	_reactMessage(channelID, messageID, reaction) {
		// @ts-ignore
		return this.client.api.channels[channelID].messages[messageID].reactions[this.client.emojis.resolveIdentifier(reaction)]['@me'].put();
	}

	_checkRoleReaction(msg, reaction, role) {
		const list = msg.guild.settings.roles.reactions;
		if (list.length) for (const entry of list) if (entry.emoji === reaction || entry.role === role) return true;
		return false;
	}

};
