import { DbSet } from '#lib/database';
import { LanguageHelp } from '#lib/i18n/LanguageHelp';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { BrandingColors } from '#utils/constants';
import { pickRandom } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Store } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { Collection, Message, MessageEmbed, Permissions, TextChannel } from 'discord.js';
import type { TFunction } from 'i18next';

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
function sortCommandsAlphabetically(_: SkyraCommand[], __: SkyraCommand[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
	if (firstCategory > secondCategory) return 1;
	if (secondCategory > firstCategory) return -1;
	return 0;
}

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['commands', 'cmd', 'cmds'],
	description: LanguageKeys.Commands.General.HelpDescription,
	extendedHelp: LanguageKeys.Commands.General.HelpExtended,
	guarded: true,
	strategyOptions: { flags: ['cat', 'categories', 'all'] }
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		if (args.finished) {
			if (args.getFlags('cat', 'categories')) return this.categories(message, args);
			if (args.getFlags('all')) return this.all(message, args);
		}

		const category = await args.pickResult(UserCommand.categories);
		if (category.success) return this.display(message, args, category.value - 1);

		const page = await args.pickResult('integer', { minimum: 0 });
		if (page.success) return this.display(message, args, page.value - 1);

		// Handle case for a single command
		const command = await args.pickResult('commandName');
		if (command.success) return message.send(await this.buildCommandHelp(message, args.t, command.value));

		return this.canRunPaginatedMessage(message) ? this.display(message, args, null) : this.all(message, args);
	}

	private canRunPaginatedMessage(message: Message) {
		return (
			message.guild !== null && (message.channel as TextChannel).permissionsFor(this.context.client.user!)!.has(PERMISSIONS_PAGINATED_MESSAGE)
		);
	}

	private async categories(message: Message, args: SkyraCommand.Args) {
		const commandsByCategory = await UserCommand.fetchCommands(message);
		let i = 0;
		const commandCategories: string[] = [];
		for (const [category, commands] of commandsByCategory) {
			const line = String(++i).padStart(2, '0');
			commandCategories.push(
				`\`${line}.\` **${category}** → ${args.t(LanguageKeys.Commands.General.HelpCommandCount, { count: commands.length })}`
			);
		}

		return message.send(commandCategories);
	}

	private async all(message: Message, args: SkyraCommand.Args) {
		const content = await this.buildHelp(message, args.t, args.commandContext.commandPrefix);
		try {
			const response = await message.author.send(content, { split: { char: '\n' } });
			return message.channel.type === 'dm' ? response : await message.send(args.t(LanguageKeys.Commands.General.HelpDm));
		} catch {
			return message.channel.type === 'dm' ? null : message.send(args.t(LanguageKeys.Commands.General.HelpNoDm));
		}
	}

	private async display(message: Message, args: SkyraCommand.Args, index: number | null) {
		const { commandPrefix: prefix } = args.commandContext;

		const response = await message.send(
			args.t(LanguageKeys.Commands.General.HelpAllFlag, { prefix }),
			new MessageEmbed().setDescription(pickRandom(args.t(LanguageKeys.System.Loading))).setColor(BrandingColors.Secondary)
		);

		const display = await this.buildDisplay(message, args.t, prefix);
		if (index !== null) display.setIndex(index);

		await display.start(response as GuildMessage, message.author);
		return response;
	}

	private async buildHelp(message: Message, language: TFunction, prefix: string) {
		const commands = await UserCommand.fetchCommands(message);

		const helpMessage: string[] = [];
		for (const [category, list] of commands) {
			helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, language, prefix, false)).join('\n'), '');
		}

		return helpMessage.join('\n');
	}

	private async buildDisplay(message: Message, language: TFunction, prefix: string) {
		const commandsByCategory = await UserCommand.fetchCommands(message);

		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await DbSet.fetchColor(message)) });
		for (const [category, commands] of commandsByCategory) {
			display.addPageEmbed((template: MessageEmbed) =>
				template
					.setTitle(`${category} Commands`)
					.setDescription(commands.map(this.formatCommand.bind(this, language, prefix, true)).join('\n'))
			);
		}

		return display.setIdle(Time.Minute * 10);
	}

	private async buildCommandHelp(message: Message, t: TFunction, command: SkyraCommand) {
		const builderData = t(LanguageKeys.System.HelpTitles);

		const builder = new LanguageHelp()
			.setUsages(builderData.usages)
			.setAliases(builderData.aliases)
			.setExtendedHelp(builderData.extendedHelp)
			.setExplainedUsage(builderData.explainedUsage)
			.setExamples(builderData.examples)
			.setPossibleFormats(builderData.possibleFormats)
			.setReminder(builderData.reminders);

		const extendedHelpData = t(command.extendedHelp);
		const extendedHelp = builder.display(command.name, this.formatAliases(t, command.aliases), extendedHelpData);

		const data = t(LanguageKeys.Commands.General.HelpData, {
			footerName: command.name,
			titleDescription: t(command.description)
		});
		const user = this.context.client.user!;
		return new MessageEmbed()
			.setColor(await DbSet.fetchColor(message))
			.setAuthor(user.username, user.displayAvatarURL({ size: 128, format: 'png' }))
			.setTimestamp()
			.setFooter(data.footer)
			.setTitle(data.title)
			.setDescription(extendedHelp);
	}

	private formatAliases(t: TFunction, aliases: readonly string[]): string | null {
		if (aliases.length === 0) return null;
		return t(LanguageKeys.Globals.AndListValue, { value: aliases.map((alias) => `\`${alias}\``) });
	}

	private formatCommand(t: TFunction, prefix: string, paginatedMessage: boolean, command: SkyraCommand) {
		const description = t(command.description);
		return paginatedMessage ? `• ${prefix}${command.name} → ${description}` : `• **${prefix}${command.name}** → ${description}`;
	}

	private static categories = Args.make<number>(async (parameter, { argument, message }) => {
		const lowerCasedParameter = parameter.toLowerCase();
		const commandsByCategory = await this.fetchCommands(message);
		for (const [page, category] of commandsByCategory.keyArray().entries()) {
			// Add 1, since 1 will be subtracted later
			if (category.toLowerCase() === lowerCasedParameter) return Args.ok(page + 1);
		}

		return Args.error({ argument, parameter });
	});

	private static async fetchCommands(message: Message) {
		const commands = Store.injectedContext.stores.get('commands');
		const filtered = new Collection<string, SkyraCommand[]>();
		await Promise.all(
			commands.map(async (cmd) => {
				const result = await cmd.preconditions.run(message, cmd, { command: null! });
				if (!result.success) return;

				const command = cmd as SkyraCommand;
				const category = filtered.get(command.fullCategory.join(' → '));
				if (category) category.push(command as SkyraCommand);
				else filtered.set(command.fullCategory.join(' → '), [command as SkyraCommand]);
			})
		);

		return filtered.sort(sortCommandsAlphabetically);
	}
}
