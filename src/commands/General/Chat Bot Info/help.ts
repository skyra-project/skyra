import { DbSet } from '#lib/database';
import { LanguageHelp } from '#lib/i18n/LanguageHelp';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { UserPaginatedMessage } from '#lib/structures/UserPaginatedMessage';
import { GuildMessage } from '#lib/types';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { isNumber, noop } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Collection, Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import { TFunction } from 'i18next';
import { Command } from 'klasa';

const PERMISSIONS_PAGINATED_MESSAGE = new Permissions([
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
	description: LanguageKeys.Commands.General.HelpDescription,
	extendedHelp: LanguageKeys.Commands.General.HelpExtended,
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

	public async run(message: Message, [commandOrPage]: [SkyraCommand | number | undefined]) {
		const t = await message.fetchT();

		if (message.flagArgs.categories || message.flagArgs.cat) {
			const commandsByCategory = await this._fetchCommands(message);
			let i = 0;
			const commandCategories: string[] = [];
			for (const [category, commands] of commandsByCategory) {
				const line = String(++i).padStart(2, '0');
				commandCategories.push(
					`\`${line}.\` **${category}** → ${t(LanguageKeys.Commands.General.HelpCommandCount, { count: commands.length })}`
				);
			}

			return message.send(commandCategories);
		}

		// Handle case for a single command
		const command = typeof commandOrPage === 'object' ? commandOrPage : null;
		if (command) return message.send(await this.buildCommandHelp(message, t, command));

		const prefix = (await this.client.fetchPrefix(message)) as string;

		if (
			!message.flagArgs.all &&
			message.guild &&
			(message.channel as TextChannel).permissionsFor(this.client.user!)!.has(PERMISSIONS_PAGINATED_MESSAGE)
		) {
			const response = (await message.send(
				t(LanguageKeys.Commands.General.HelpAllFlag, { prefix }),
				new MessageEmbed({
					description: pickRandom(t(LanguageKeys.System.Loading) as string[]),
					color: BrandingColors.Secondary
				})
			)) as GuildMessage;
			const display = await this.buildDisplay(message, t, prefix);

			// Extract start page and sanitize it
			const page = isNumber(commandOrPage) ? commandOrPage - 1 : null;
			const startPage = page === null || page < 0 || page >= display.pages.length ? null : page;
			if (startPage !== null) display.setIndex(startPage);
			await display.start(response, message.author.id);
			return response;
		}

		try {
			const response = await message.author.send(await this.buildHelp(message, t, prefix), { split: { char: '\n' } });
			return message.channel.type === 'dm' ? response : await message.sendTranslated(LanguageKeys.Commands.General.HelpDm);
		} catch {
			return message.channel.type === 'dm' ? null : message.sendTranslated(LanguageKeys.Commands.General.HelpNoDm);
		}
	}

	private async buildHelp(message: Message, language: TFunction, prefix: string) {
		const commands = await this._fetchCommands(message);

		const helpMessage: string[] = [];
		for (const [category, list] of commands) {
			helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, language, prefix, false)).join('\n'), '');
		}

		return helpMessage.join('\n');
	}

	private async buildDisplay(message: Message, language: TFunction, prefix: string) {
		const commandsByCategory = await this._fetchCommands(message);

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });
		for (const [category, commands] of commandsByCategory) {
			display.addTemplatedEmbedPage((template: MessageEmbed) =>
				template
					.setTitle(`${category} Commands`)
					.setDescription(commands.map(this.formatCommand.bind(this, language, prefix, true)).join('\n'))
			);
		}

		return display;
	}

	private async buildCommandHelp(message: Message, t: TFunction, command: SkyraCommand) {
		const builderData = t(LanguageKeys.System.HelpTitles);

		const builder = new LanguageHelp()
			.setExplainedUsage(builderData.explainedUsage)
			.setExamples(builderData.examples)
			.setPossibleFormats(builderData.possibleFormats)
			.setReminder(builderData.reminders);

		const extendedHelpData = t(command.extendedHelp);
		const extendedHelp = builder.display(command.name, extendedHelpData);

		const data = t(LanguageKeys.Commands.General.HelpData, {
			footerName: command.name,
			titleDescription: t(command.description),
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

	private formatCommand(t: TFunction, prefix: string, richDisplay: boolean, command: SkyraCommand) {
		const description = t(command.description);
		return richDisplay ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	private async _fetchCommands(message: Message) {
		const run = this.client.inhibitors.run.bind(this.client.inhibitors, message);
		const commands = new Collection<string, SkyraCommand[]>();
		await Promise.all(
			this.client.commands.map((command) =>
				run(command, true)
					.then(() => {
						const category = commands.get(command.fullCategory.join(' → '));
						if (category) category.push(command as SkyraCommand);
						else commands.set(command.fullCategory.join(' → '), [command as SkyraCommand]);
						return null;
					})
					.catch(noop)
			)
		);

		return commands.sort(sortCommandsAlphabetically);
	}
}
