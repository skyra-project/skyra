import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { UserRichDisplay } from '@lib/structures/UserRichDisplay';
import { GuildSettings } from '@lib/types/namespaces/GuildSettings';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { isFunction, isNumber, noop } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BrandingColors } from '@utils/constants';
import { LanguageHelp, LanguageHelpDisplayOptions } from '@utils/LanguageHelp';
import { pickRandom } from '@utils/util';
import { Collection, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { Command, KlasaMessage } from 'klasa';

type ExtendedHelpData = string | LanguageHelpDisplayOptions;

const PERMISSIONS_RICHDISPLAY = new Permissions([
	Permissions.FLAGS.MANAGE_MESSAGES,
	Permissions.FLAGS.ADD_REACTIONS,
	Permissions.FLAGS.EMBED_LINKS,
	Permissions.FLAGS.READ_MESSAGE_HISTORY
]);

/**
 * Sorts a collection alphabetically as based on the keys, rather than the values.
 * This is used to ensure that subcategories are listed in the pages right after the main category.
 * @param _ The first element for comparison
 * @param __ The second element for comparison
 * @param firstCategory Key of the first element for comparison
 * @param secondCategory Key of the second element for comparison
 */
function sortCommandsAlphabetically(_: Command[], __: Command[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
	if (firstCategory > secondCategory) return 1;
	if (secondCategory > firstCategory) return -1;
	return 0;
}

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['commands', 'cmd', 'cmds'],
	description: (language) => language.get(LanguageKeys.Commands.General.HelpDescription),
	guarded: true,
	usage: '(Command:command|page:integer|category:category)',
	flagSupport: true
})
export default class extends SkyraCommand {
	public async init() {
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
				commandCategories.push(
					`\`${line}.\` **${category}** → ${language.get(
						// TODO: i18next should do this automatically
						commands.length === 1 ? LanguageKeys.Commands.General.HelpCommandCount : LanguageKeys.Commands.General.HelpCommandCountPlural,
						{ count: commands.length }
					)}`
				);
			}
			return message.sendMessage(commandCategories);
		}

		// Handle case for a single command
		const command = typeof commandOrPage === 'object' ? commandOrPage : null;
		if (command) return message.sendEmbed(await this.buildCommandHelp(message, command));

		if (
			!message.flagArgs.all &&
			message.guild &&
			(message.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_RICHDISPLAY)
		) {
			const response = await message.sendMessage(
				message.language.get(LanguageKeys.Commands.General.HelpAllFlag, { prefix: message.guildSettings.get(GuildSettings.Prefix) }),
				new MessageEmbed({ description: pickRandom(message.language.get(LanguageKeys.System.Loading)), color: BrandingColors.Secondary })
			);
			const display = await this.buildDisplay(message);

			// Extract start page and sanitize it
			const page = isNumber(commandOrPage) ? commandOrPage - 1 : null;
			const startPage = page === null || page < 0 || page >= display.pages.length ? null : page;
			await display.start(response, message.author.id, startPage === null ? undefined : { startPage });
			return response;
		}

		try {
			const response = await message.author.send(await this.buildHelp(message), { split: { char: '\n' } });
			return message.channel.type === 'dm' ? response : await message.sendLocale(LanguageKeys.Commands.General.HelpDm);
		} catch {
			return message.channel.type === 'dm' ? null : message.sendLocale(LanguageKeys.Commands.General.HelpNodm);
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

		const display = new UserRichDisplay(new MessageEmbed().setColor(await DbSet.fetchColor(message)));
		for (const [category, commands] of commandsByCategory) {
			display.addPage((template: MessageEmbed) =>
				template
					.setTitle(`${category} Commands`)
					.setDescription(commands.map(this.formatCommand.bind(this, message, prefix, true)).join('\n'))
			);
		}

		return display;
	}

	private async buildCommandHelp(message: KlasaMessage, command: Command) {
		const builderData = message.language.get(LanguageKeys.System.HelpTitles);

		const builder = new LanguageHelp()
			.setExplainedUsage(builderData.explainedUsage)
			.setExamples(builderData.examples)
			.setPossibleFormats(builderData.possibleFormats)
			.setReminder(builderData.reminders);

		const extendedHelpData = isFunction(command.extendedHelp)
			? (command.extendedHelp(message.language) as ExtendedHelpData)
			: command.extendedHelp;

		const extendedHelp = typeof extendedHelpData === 'string' ? extendedHelpData : builder.display(command.name, extendedHelpData);

		const data = message.language.get(LanguageKeys.Commands.General.HelpData, {
			footerName: command.name,
			titleDescription: isFunction(command.description) ? command.description(message.language) : command.description,
			usage: command.usage.fullUsage(message),
			extendedHelp
		});
		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setAuthor(this.client.user!.username, this.client.user!.displayAvatarURL({ size: 128, format: 'png' }))
			.setTimestamp()
			.setFooter(data.footer)
			.setTitle(data.title)
			.setDescription([data.usage, data.extended].join('\n'));
	}

	private formatCommand(message: KlasaMessage, prefix: string, richDisplay: boolean, command: Command) {
		const description = isFunction(command.description) ? command.description(message.language) : command.description;
		return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	private async _fetchCommands(message: KlasaMessage) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Collection<string, Command[]>();
		await Promise.all(
			this.client.commands.map((command) =>
				run(command, true)
					.then(() => {
						const category = commands.get(command.fullCategory.join(' → '));
						if (category) category.push(command);
						else commands.set(command.fullCategory.join(' → '), [command]);
						return null;
					})
					.catch(noop)
			)
		);

		return commands.sort(sortCommandsAlphabetically);
	}
}
