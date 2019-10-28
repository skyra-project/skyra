import { MessageEmbed, Permissions, TextChannel, Collection } from 'discord.js';
import { CommandStore, KlasaMessage, util, Command } from 'klasa';
import { SkyraCommand } from '../../../lib/structures/SkyraCommand';
import { UserRichDisplay } from '../../../lib/structures/UserRichDisplay';
import { getColor, noop } from '../../../lib/util/util';
import { GuildSettings } from '../../../lib/types/settings/GuildSettings';
import { BrandingColors } from '../../../lib/util/constants';

const PERMISSIONS_RICHDISPLAY = new Permissions([Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.ADD_REACTIONS]);

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['commands', 'cmd', 'cmds'],
			description: language => language.tget('COMMAND_HELP_DESCRIPTION'),
			guarded: true,
			usage: '(Command:command|page:integer|category:category)',
			flagSupport: true
		});

		this.createCustomResolver('command', (arg, possible, message) => {
			if (!arg) return undefined;
			return this.client.arguments.get('commandname')!.run(arg, possible, message);
		});
		this.createCustomResolver('category', async (arg, _, msg) => {
			if (!arg) return undefined;
			arg = arg.toLowerCase();
			const commandsByCategory = await this._fetchCommands(msg);
			for (const [page, category] of commandsByCategory.keyArray().entries()) {
				// Add 1, since 1 will be subtracted later
				if (category.toLowerCase() === arg) return page + 1;
			}
			return undefined;
		});
	}

	public async run(message: KlasaMessage, [commandOrPage]: [Command | number | undefined]) {
		if (message.flagArgs.categories || message.flagArgs.cat) {
			const commandsByCategory = await this._fetchCommands(message);
			const { language } = message;
			let i = 0;
			const commandCategories: string[] = [];
			for (const [category, commands] of commandsByCategory) {
				const line = String(++i).padStart(2, '0');
				commandCategories.push(`\`${line}.\` **${category}** → ${language.tget('COMMAND_HELP_COMMAND_COUNT', commands.length)}`);
			}
			return message.sendMessage(commandCategories);
		}

		// Handle case for a single command
		const command = typeof commandOrPage === 'object' ? commandOrPage : null;
		if (command) {
			return message.sendMessage([
				message.language.tget('COMMAND_HELP_TITLE', command.name, util.isFunction(command.description) ? command.description(message.language) : command.description),
				message.language.tget('COMMAND_HELP_USAGE', command.usage.fullUsage(message)),
				message.language.tget('COMMAND_HELP_EXTENDED', util.isFunction(command.extendedHelp) ? command.extendedHelp(message.language) : command.extendedHelp)
			].join('\n'));
		}

		if (!message.flagArgs.all && message.guild && (message.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_RICHDISPLAY)) {
			const response = await message.sendMessage(
				message.language.tget('COMMAND_HELP_ALL_FLAG', message.guildSettings.get(GuildSettings.Prefix)),
				new MessageEmbed({ description: message.language.tget('SYSTEM_LOADING'), color: BrandingColors.Secondary })
			);
			const display = await this.buildDisplay(message);

			// Extract start page and sanitize it
			const page = util.isNumber(commandOrPage) ? commandOrPage - 1 : null;
			const startPage = page === null || page < 0 || page >= display.pages.length
				? null
				: page;
			await display.start(response, message.author.id, startPage === null ? undefined : { startPage });
			return response;
		}

		try {
			const response = await message.author.send(await this.buildHelp(message), { split: { 'char': '\n' } });
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
		const commandsByCategory = await this._fetchCommands(message);
		const prefix = message.guildSettings.get(GuildSettings.Prefix);

		const display = new UserRichDisplay(new MessageEmbed()
			.setColor(getColor(message)));
		for (const [category, commands] of commandsByCategory) {
			display.addPage((template: MessageEmbed) => template
				.setTitle(`${category} Commands`)
				.setDescription(commands.map(this.formatCommand.bind(this, message, prefix, true)).join('\n')));
		}

		return display;
	}

	private formatCommand(message: KlasaMessage, prefix: string, richDisplay: boolean, command: Command) {
		const description = util.isFunction(command.description) ? command.description(message.language) : command.description;
		return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	private async _fetchCommands(message: KlasaMessage) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Collection<string, Command[]>();
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
