const { Command, klasaUtil: util } = require('../../../index');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['commands'],
			guarded: true,
			description: (msg) => msg.language.get('COMMAND_HELP_DESCRIPTION'),
			usage: '(Command:cmd)'
		});

		this.createCustomResolver('cmd', (arg, possible, msg) => {
			if (!arg || arg === '') return undefined;
			return this.client.argResolver.cmd(arg, possible, msg);
		});
	}

	async run(msg, [cmd]) {
		if (cmd) {
			const info = [
				msg.language.get('COMMAND_HELP_TITLE', cmd.name, util.isFunction(cmd.description) ? cmd.description(msg) : cmd.description),
				msg.language.get('COMMAND_HELP_USAGE', cmd.usage.fullUsage(msg)),
				msg.language.get('COMMAND_HELP_EXTENDED', util.isFunction(cmd.extendedHelp) ? cmd.extendedHelp(msg) : cmd.extendedHelp)
			].join('\n');
			return msg.sendMessage(info);
		}
		const help = await this.buildHelp(msg);
		const categories = Object.keys(help);
		const helpMessage = ['📃 | *Help Message*\n'];
		for (const category of categories) {
			// helpMessage.push(`***${category} Commands***\n`);
			const subCategories = Object.keys(help[category]);
			for (const subCategory of subCategories) {
				helpMessage.push(`***${category}/${subCategory} Commands***\n`);
				helpMessage.push(`${help[category][subCategory].join('\n')}\n`);
			}
		}

		return msg.author.send(helpMessage, { split: { char: '\n' } })
			.then(() => { if (msg.channel.type !== 'dm' && this.client.user.bot) msg.sendMessage(msg.language.get('COMMAND_HELP_DM')); })
			.catch(() => { if (msg.channel.type !== 'dm' && this.client.user.bot) msg.sendMessage(msg.language.get('COMMAND_HELP_NODM')); });
	}

	async buildHelp(msg) {
		const help = {};
		const prefix = msg.guildConfigs.prefix;

		await Promise.all(this.client.commands.map((command) =>
			this.client.inhibitors.run(msg, command, true)
				.then(() => {
					if (!help.hasOwnProperty(command.category)) help[command.category] = {};
					if (!help[command.category].hasOwnProperty(command.subCategory)) help[command.category][command.subCategory] = [];
					const description = typeof command.description === 'function' ? command.description(msg) : command.description;
					help[command.category][command.subCategory].push(`• __**${prefix}${command.name}**__ → ${description}`);
				})
				.catch(() => {
					// noop
				})
		));

		return help;
	}

};
