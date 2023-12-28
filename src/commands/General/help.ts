import { LanguageHelp, type LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { isGuildMessage, isPrivateMessage } from '#utils/common';
import { getColor, splitMessage } from '#utils/util';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { UserOrMemberMentionRegex } from '@sapphire/discord-utilities';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { Args, Result, container, type MessageCommand } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import type { TFunction } from '@sapphire/plugin-i18next';
import { Collection, EmbedBuilder, PermissionFlagsBits, type Message } from 'discord.js';

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
	detailedDescription: LanguageKeys.Commands.General.HelpExtended,
	flags: ['cat', 'categories', 'all'],
	guarded: true
})
export class UserCommand extends SkyraCommand {
	public override async messageRun(message: Message, args: SkyraCommand.Args, context: SkyraCommand.RunContext) {
		if (args.finished) {
			if (args.getFlags('cat', 'categories')) return this.helpCategories(message, args);
			if (args.getFlags('all')) return this.all(message, args, context);
		}

		const category = await args.pickResult(UserCommand.categories);
		if (category.isOk()) return this.display(message, args, category.unwrap() - 1, context);

		const page = await args.pickResult('integer', { minimum: 0 });
		if (page.isOk()) return this.display(message, args, page.unwrap() - 1, context);

		// Handle case for a single command
		const command = await args.pickResult('commandName');
		if (command.isOk()) {
			const embed = await this.buildCommandHelp(message, args, command.unwrap(), this.getCommandPrefix(context));
			return send(message, { embeds: [embed] });
		}

		return this.display(message, args, null, context);
	}

	private getCommandPrefix(context: SkyraCommand.RunContext): string {
		return (context.prefix instanceof RegExp && !context.commandPrefix.endsWith(' ')) || UserOrMemberMentionRegex.test(context.commandPrefix)
			? `${context.commandPrefix} `
			: context.commandPrefix;
	}

	private async helpCategories(message: Message, args: SkyraCommand.Args) {
		const commandsByCategory = await UserCommand.fetchCommands(message);
		let i = 0;
		const commandCategories: string[] = [];
		for (const [category, commands] of commandsByCategory) {
			const line = String(++i).padStart(2, '0');
			commandCategories.push(
				`\`${line}.\` **${category}** → ${args.t(LanguageKeys.Commands.General.HelpCommandCount, { count: commands.length })}`
			);
		}

		const content = commandCategories.join('\n');
		return send(message, content);
	}

	private async all(message: Message, args: SkyraCommand.Args, context: SkyraCommand.RunContext) {
		const fullContent = await this.buildHelp(message, args.t, this.getCommandPrefix(context));
		const contents = splitMessage(fullContent, { char: '\n', maxLength: 2000 });

		for (const content of contents) {
			const result = await Result.fromAsync(message.author.send(content));
			if (result.isOk()) continue;

			if (isPrivateMessage(message)) this.error(LanguageKeys.Commands.General.HelpNoDm);
			return;
		}

		if (isGuildMessage(message)) await send(message, args.t(LanguageKeys.Commands.General.HelpDm));
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	private async display(message: Message, args: SkyraCommand.Args, index: number | null, context: SkyraCommand.RunContext) {
		const prefix = this.getCommandPrefix(context);

		const content = args.t(LanguageKeys.Commands.General.HelpAllFlag, { prefix });

		const display = await this.buildDisplay(message, args.t, prefix);
		if (index !== null) display.setIndex(index);

		const response = await send(message, content);
		await display.run(response, message.author);
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

		const display = new PaginatedMessage({
			template: new EmbedBuilder().setColor(getColor(message))
		}) //
			.setSelectMenuOptions((pageIndex) => ({ label: commandsByCategory.at(pageIndex - 1)![0].fullCategory!.join(' → ') }));

		for (const [category, commands] of commandsByCategory) {
			display.addPageEmbed((embed) =>
				embed //
					.setTitle(`${category} Commands`)
					.setDescription(commands.map(this.formatCommand.bind(this, language, prefix, true)).join('\n'))
			);
		}

		return display;
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	private async buildCommandHelp(message: Message, args: SkyraCommand.Args, command: SkyraCommand, prefixUsed: string) {
		const builderData = args.t(LanguageKeys.System.HelpTitles);

		const builder = new LanguageHelp()
			.setUsages(builderData.usages)
			.setAliases(builderData.aliases)
			.setExtendedHelp(builderData.extendedHelp)
			.setExplainedUsage(builderData.explainedUsage)
			.setExamples(builderData.examples)
			.setPossibleFormats(builderData.possibleFormats)
			.setReminder(builderData.reminders);

		const extendedHelpData = args.t(command.detailedDescription, {
			replace: { prefix: prefixUsed }
		}) as LanguageHelpDisplayOptions;
		const extendedHelp = builder.display(command.name, this.formatAliases(args.t, command.aliases), extendedHelpData, prefixUsed);

		const data = args.t(LanguageKeys.Commands.General.HelpData, {
			footerName: command.name,
			titleDescription: args.t(command.description)
		});
		return new EmbedBuilder()
			.setColor(getColor(message))
			.setTimestamp()
			.setFooter({ text: data.footer })
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
		const commandsByCategory = await UserCommand.fetchCommands(message);
		for (const [page, category] of [...commandsByCategory.keys()].entries()) {
			// Add 1, since 1 will be subtracted later
			if (category.toLowerCase() === lowerCasedParameter) return Args.ok(page + 1);
		}

		return Args.error({ argument, parameter });
	});

	private static async fetchCommands(message: Message) {
		const commands = container.stores.get('commands');
		const filtered = new Collection<string, SkyraCommand[]>();
		await Promise.all(
			commands.map(async (cmd) => {
				const command = cmd as SkyraCommand;
				if (command.hidden) return;

				const result = await cmd.preconditions.messageRun(message, command as MessageCommand, { command: null! });
				if (result.isErr()) return;

				const category = filtered.get(command.fullCategory.join(' → '));
				if (category) category.push(command);
				else filtered.set(command.fullCategory.join(' → '), [command]);
			})
		);

		return filtered.sort(sortCommandsAlphabetically);
	}
}
