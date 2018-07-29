const { Command, RichDisplay, util } = require('klasa');
const { MessageEmbed, Permissions } = require('discord.js');

const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);
const time = 1000 * 60 * 3;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands', 'cmd', 'cmds'],
			guarded: true,
			description: (message) => message.language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(Command:command)'
		});

		this.createCustomResolver('command', (arg, possible, message) => {
			if (!arg || arg === '') return undefined;
			return this.client.arguments.get('command').run(arg, possible, message);
		});

		// Cache the handlers
		this.handlers = new Map();
	}

	async run(message, [command]) {
		if (command) {
			return message.sendMessage([
				message.language.get('COMMAND_HELP_TITLE', command.name, util.isFunction(command.description) ? command.description(message) : command.description),
				message.language.get('COMMAND_HELP_USAGE', command.usage.fullUsage(message)),
				message.language.get('COMMAND_HELP_EXTENDED', util.isFunction(command.extendedHelp) ? command.extendedHelp(message) : command.extendedHelp)
			].join('\n'));
		}

		if (!message.flags.all && message.guild && message.channel.permissionsFor(this.client.user).has(PERMISSIONS_RICHDISPLAY)) {
			// Finish the previous handler
			const previousHandler = this.handlers.get(message.author.id);
			if (previousHandler) previousHandler.stop();

			const handler = await (await this.buildDisplay(message)).run(await message.send('Loading Commands...'), {
				filter: (reaction, user) => user.id === message.author.id,
				time
			});
			handler.once('end', () => this.handlers.delete(message.author.id));
			this.handlers.set(message.author.id, handler);
			return handler;
		}

		return message.author.send(await this.buildHelp(message), { split: { char: '\n' } })
			.then(() => { if (message.channel.type !== 'dm') message.sendLocale('COMMAND_HELP_DM'); })
			.catch(() => { if (message.channel.type !== 'dm') message.sendLocale('COMMAND_HELP_NODM'); });
	}

	async buildHelp(message) {
		const commands = await this._fetchCommands(message);
		const { prefix } = message.guildConfigs;

		const helpMessage = [];
		for (const [category, list] of commands)
			helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, message, prefix, false)).join('\n'), '');

		return helpMessage.join('\n');
	}

	async buildDisplay(message) {
		const commands = await this._fetchCommands(message);
		const { prefix } = message.guildConfigs;
		const display = new RichDisplay();
		const color = message.member.displayColor;
		for (const [category, list] of commands) {
			display.addPage(new MessageEmbed()
				.setTitle(`${category} Commands`)
				.setColor(color)
				.setDescription(list.map(this.formatCommand.bind(this, message, prefix, true)).join('\n'))
			);
		}

		return display;
	}

	formatCommand(message, prefix, richDisplay, command) {
		const description = typeof command.description === 'function' ? command.description(message) : command.description;
		return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	async _fetchCommands(message) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Map();
		await Promise.all(this.client.commands.map((command) => run(command, true)
			.then(() => {
				const category = commands.get(command.category);
				if (category) category.push(command);
				else commands.set(command.category, [command]);
			}).catch(() => {
				// noop
			})
		));

		return commands;
	}

};
