const { Command, klasaUtil: { codeBlock } } = require('../../index');

const REG_TYPE = /alias|reaction/i;
const REG_REAC = /^<(:[^:]+:\d{17,19})>$/;

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			requiredPermissions: ['ADD_REACTIONS'],
			cooldown: 5,
			description: (language) => language.get('COMMAND_TRIGGERS_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_TRIGGERS_EXTENDED'),
			permissionLevel: 6,
			quotedStringSupport: true,
			runIn: ['text'],
			usage: '[list|add|remove] (type:type) (input:input) (output:output)',
			usageDelim: ' '
		});

		this.createCustomResolver('type', (arg, possible, msg, [action = 'list']) => {
			if (action === 'list') return undefined;
			if (REG_TYPE.test(arg)) return arg.toLowerCase();
			throw msg.language.get('COMMAND_TRIGGERS_NOTYPE');
		}).createCustomResolver('input', (arg, possible, msg, [action = 'list']) => {
			if (action === 'list') return undefined;
			if (!arg) throw msg.language.get('COMMAND_TRIGGERS_NOOUTPUT');
			return arg.toLowerCase();
		}).createCustomResolver('output', async (arg, possible, msg, [action = 'list', type]) => {
			if (action === 'list' || action === 'remove') return undefined;
			if (!arg) throw msg.language.get('COMMAND_TRIGGERS_NOOUTPUT');
			if (type === 'reaction') {
				try {
					if (REG_REAC.test(arg)) [, arg] = REG_REAC.exec(arg);
					await msg.react(arg);
					return arg;
				} catch (_) {
					throw msg.language.get('COMMAND_TRIGGERS_INVALIDREACTION');
				}
			} else if (type === 'alias') {
				const command = this.client.commands.get(arg);
				if (command && command.permissionLevel < 10) return arg;
				throw msg.language.get('COMMAND_TRIGGERS_INVALIDALIAS');
			} else {
				return null;
			}
		});
	}

	async run(msg, [action = 'list', type, input, output]) {
		switch (action) {
			case 'list': return this.list(msg);
			case 'add': return this.add(msg, type, input, output);
			case 'remove': return this.remove(msg, type, input);
			default: return null;
		}
	}

	async remove(msg, type, input) {
		const list = this._getList(msg, type);
		const index = list.findIndex(entry => entry.input === input);
		if (index === -1) throw msg.language.get('COMMAND_TRIGGERS_REMOVE_NOTTAKEN');

		// Create a shallow clone and remove the item
		const clone = [...list];
		clone.splice(index, 1);

		const { errors } = await msg.guild.settings.update(this._getListName(type), clone, { action: 'overwrite' });
		if (errors.length) throw errors[0];

		return msg.sendLocale('COMMAND_TRIGGERS_REMOVE');
	}

	async add(msg, type, input, output) {
		const list = this._getList(msg, type);
		if (list.some(entry => entry.input === input)) throw msg.language.get('COMMAND_TRIGGERS_ADD_TAKEN');

		const { errors } = await msg.guild.settings.update(this._getListName(type), [...list, this._format(type, input, output)], { action: 'overwrite' });
		if (errors.length) throw errors[0];

		return msg.sendLocale('COMMAND_TRIGGERS_ADD');
	}

	list(msg) {
		const { trigger } = msg.guild.settings;
		const output = [];
		for (const alias of trigger.alias)
			output.push(`Alias    :: ${alias.input} -> ${alias.output}`);
		for (const react of trigger.includes)
			output.push(`Reaction :: ${react.input} -> ${react.output}`);
		if (!output.length) throw msg.language.get('COMMAND_TRIGGERS_LIST_EMPTY');
		return msg.sendMessage(codeBlock('asciidoc', output.join('\n')));
	}

	_format(type, input, output) {
		switch (type) {
			case 'alias': return { input, output };
			case 'reaction': return { action: 'react', input, output };
			default: throw new TypeError('UNKNOWN TYPE');
		}
	}

	_getListName(type) {
		switch (type) {
			case 'alias': return 'trigger.alias';
			case 'reaction':
			default: return 'trigger.includes';
		}
	}

	_getList(msg, type) {
		switch (type) {
			case 'alias': return msg.guild.settings.trigger.alias;
			case 'reaction':
			default: return msg.guild.settings.trigger.includes;
		}
	}

};
