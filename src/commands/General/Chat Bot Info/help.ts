import { MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { CommandStore, KlasaMessage, util } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { getColor, noop } from '../../../lib/util/util';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';

const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['commands', 'cmd', 'cmds'],
			description: language => language.tget('COMMAND_HELP_DESCRIPTION'),
			guarded: true,
			usage: '(Command:command|page:integer)',
			flagSupport: true
		});

		this.createCustomResolver('command', (arg, possible, message) => {
			if (!arg || arg === '') return undefined;
			return this.client.arguments.get('command').run(arg, possible, message);
		});
	}

	public async run(message: KlasaMessage, [commandOrPage]: [SkyraCommand | number | undefined]) {
		// Handle case for a single command
		const command = commandOrPage && !util.isNumber(commandOrPage) ? commandOrPage : null;
		if (command) {
			return message.sendMessage([
				message.language.tget('COMMAND_HELP_TITLE', command.name, util.isFunction(command.description) ? command.description(message.language) : command.description),
				message.language.tget('COMMAND_HELP_USAGE', command.usage.fullUsage(message)),
				message.language.tget('COMMAND_HELP_EXTENDED', util.isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp)
			].join('\n'));
		}

		if (!message.flagArgs.all && message.guild && (message.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_RICHDISPLAY)) {
			const response = await message.sendEmbed(new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: getColor(message) || 0xFFAB2D })) as KlasaMessage;
			const display = await this.buildDisplay(message);

			// Extract start page and sanitize it
			let startPage = commandOrPage && util.isNumber(commandOrPage) ? --commandOrPage : null;
			if (startPage !== null) {
				if (startPage < 0 || startPage >= display.pages.length) startPage = 0;
			}
			await display.start(response, message.author!.id, startPage === null ? undefined : { startPage });
			return response;
		}

		try {
			const response = await message.author!.send(await this.buildHelp(message), { split: { 'char': '\n' } });
			return message.channel.type === 'dm' ? response : message.sendLocale('COMMAND_HELP_DM');
		} catch {
			return message.channel.type === 'dm' ? null : message.sendLocale('COMMAND_HELP_NODM');
		}
	}

	private async buildHelp(message: KlasaMessage) {
		const commands = await this._fetchCommands(message);
		const prefix = message.guildSettings.get(GuildSettings.Prefix);

		const helpMessage: string[] = [];
		for (const [category, list] of commands) {
			helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, message, prefix, false)).join('\n'), '');
		}

		return helpMessage.join('\n');
	}

	private async buildDisplay(message: KlasaMessage) {
		const commands = await this._fetchCommands(message);
		const prefix = message.guildSettings.get(GuildSettings.Prefix);

		const display = new UserRichDisplay();
		const color = getColor(message) || 0xFFAB2D;
		for (const [category, list] of commands) {
			display.addPage(new MessageEmbed()
				.setTitle(`${category} Commands`)
				.setColor(color)
				.setDescription(list.map(this.formatCommand.bind(this, message, prefix, true)).join('\n')));
		}

		return display;
	}

	private formatCommand(message: KlasaMessage, prefix: string, richDisplay: boolean, command: SkyraCommand) {
		const description = util.isFunction(command.description) ? command.description(message.language) : command.description;
		return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	private async _fetchCommands(message: KlasaMessage) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Map();
		await Promise.all(this.client.commands.map(command => run(command, true)
			.then(() => {
				const category = commands.get(command.category);
				if (category) category.push(command);
				else commands.set(command.category, [command]);
				return null;
			}).catch(noop)));

		return commands;
	}

}
