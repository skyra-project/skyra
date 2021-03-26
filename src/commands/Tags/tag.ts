import { InvalidTypeError, parseAndValidate, parseParameter } from '#lib/customCommands';
import { CustomCommand, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, UserPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { parse as parseColour } from '#utils/Color';
import { requiresLevel, requiresPermissions } from '#utils/decorators';
import { sendLoadingMessage } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { chunk, codeBlock, cutText } from '@sapphire/utilities';
import { Identifiers, ParserUnexpectedTokenError, PartType, UserError } from '@skyra/tags';
import { MessageEmbed } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['tags', 'customcommand', 'copypasta'],
	description: LanguageKeys.Commands.Tags.TagDescription,
	extendedHelp: LanguageKeys.Commands.Tags.TagExtended,
	runIn: ['text'],
	strategyOptions: { flags: ['embed'], options: ['color', 'colour'] },
	permissions: ['MANAGE_MESSAGES'],
	subCommands: ['add', 'remove', 'edit', 'rename', 'source', 'list', 'reset', { input: 'show', default: true }]
})
export class UserCommand extends SkyraCommand {
	// Based on HEX regex from #utils/Color
	// eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
	#kHexlessRegex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/i;

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async add(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const content = await args.rest('string');

		await message.guild.writeSettings((settings) => {
			if (settings[GuildSettings.CustomCommands].some((command) => command.id === id))
				this.error(LanguageKeys.Commands.Tags.TagExists, { tag: id });

			settings[GuildSettings.CustomCommands].push(this.createTag(args, id, content));
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagAdded, { name: id, content: cutText(content, 1850) }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();

		await message.guild.writeSettings((settings) => {
			const tagIndex = settings[GuildSettings.CustomCommands].findIndex((command) => command.id === id);
			if (tagIndex === -1) this.error(LanguageKeys.Commands.Tags.TagNotExists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1);
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagRemoved, { name: id }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async rename(message: GuildMessage, args: SkyraCommand.Args) {
		const previous = (await args.pick('string')).toLowerCase();
		const next = (await args.pick('string')).toLowerCase();

		await message.guild.writeSettings((settings) => {
			const tags = settings[GuildSettings.CustomCommands];

			// Get previous tag:
			const tag = tags.find((tag) => tag.id === previous);
			if (tag === undefined) this.error(LanguageKeys.Commands.Tags.TagNotExists, { tag: previous });

			// Check if a tag with the name exists:
			if (tags.some((tag) => tag.id === next)) this.error(LanguageKeys.Commands.Tags.TagExists, { tag: next });

			// Rename tag:
			tag.id = next;
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagRenamed, { name: next, previous }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		await message.guild.writeSettings((settings) => {
			settings[GuildSettings.CustomCommands].length = 0;
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagReset));
	}

	@requiresLevel(PermissionLevels.Moderator, async (_: GuildMessage, args: SkyraCommand.Args) => {
		throw args.t(LanguageKeys.Commands.Tags.TagPermissionLevel);
	})
	public async edit(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const content = await args.rest('string');

		await message.guild.writeSettings((settings) => {
			const tagIndex = settings[GuildSettings.CustomCommands].findIndex((command) => command.id === id);
			if (tagIndex === -1) this.error(LanguageKeys.Commands.Tags.TagNotExists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1, this.createTag(args, id, content));
		});

		return message.send(args.t(LanguageKeys.Commands.Tags.TagEdited, { name: id, content: cutText(content, 1000) }), {
			allowedMentions: { users: [], roles: [] }
		});
	}

	@requiresPermissions(['ADD_REACTIONS', 'EMBED_LINKS', 'MANAGE_MESSAGES', 'READ_MESSAGE_HISTORY'])
	public async list(message: GuildMessage, args: SkyraCommand.Args) {
		// Get tags, prefix, and language
		const [tags, prefix] = await message.guild.readSettings([GuildSettings.CustomCommands, GuildSettings.Prefix]);
		if (!tags.length) this.error(LanguageKeys.Commands.Tags.TagListEmpty);

		const response = await sendLoadingMessage(message, args.t);

		// Get prefix and display all tags
		const display = new UserPaginatedMessage({ template: new MessageEmbed().setColor(await this.context.db.fetchColor(message)) });

		// Add all pages, containing 30 tags each
		for (const page of chunk(tags, 30)) {
			const description = `\`${page.map((command) => `${prefix}${command.id}`).join('`, `')}\``;
			display.addPageEmbed((embed) => embed.setDescription(description));
		}

		// Run the display
		await display.start(response as GuildMessage, message.author);
		return response;
	}

	@requiresPermissions(['EMBED_LINKS'])
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const tags = await message.guild.readSettings(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === id);
		if (tag === undefined) return null;

		const iterator = tag.content.run();
		let result = iterator.next();
		while (!result.done) result = iterator.next(await parseParameter(args, result.value.type as InvalidTypeError.Type));

		return tag.embed
			? message.send(new MessageEmbed().setDescription(result.value.trim()).setColor(tag.color))
			: message.send(result.value.trim(), { allowedMentions: { users: [], roles: [] } });
	}

	public async source(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const tags = await message.guild.readSettings(GuildSettings.CustomCommands);
		const tag = tags.find((command) => command.id === id);
		return tag ? message.send(codeBlock('md', tag.content.toString()), { allowedMentions: { users: [], roles: [] } }) : null;
	}

	private createTag(args: SkyraCommand.Args, id: string, content: string): CustomCommand {
		// Create the tag data:
		const embed = args.getFlags('embed');
		return {
			id,
			content: this.parseContent(args, content),
			embed,
			color: embed ? this.parseColour(args) : 0
		};
	}

	private parseContent(args: SkyraCommand.Args, content: string) {
		try {
			return parseAndValidate(content);
		} catch (error) {
			if (!(error instanceof UserError)) throw error;

			switch (error.identifier) {
				case Identifiers.MismatchingNamedArgumentTypeValidation:
					this.error(LanguageKeys.Commands.Tags.ParseMismatchingNamedArgumentTypeValidation, error);
				case Identifiers.ParserEmptyStringTag:
					this.error(LanguageKeys.Commands.Tags.ParseParserEmptyStringTag, error);
				case Identifiers.ParserMissingToken:
					this.error(LanguageKeys.Commands.Tags.ParseParserMissingToken, error);
				case Identifiers.ParserPickMissingOptions:
					this.error(LanguageKeys.Commands.Tags.ParseParserPickMissingOptions, error);
				case Identifiers.ParserRandomDuplicatedOptions:
					this.error(LanguageKeys.Commands.Tags.ParseParserRandomDuplicatedOptions, error);
				case Identifiers.ParserRandomMissingOptions:
					this.error(LanguageKeys.Commands.Tags.ParseParserRandomMissingOptions, error);
				case Identifiers.ParserUnexpectedToken: {
					const typedError = error as ParserUnexpectedTokenError;
					this.error(LanguageKeys.Commands.Tags.ParseParserUnexpectedToken, {
						expected: this.parseContentGetPartTypeName(args, typedError.expected),
						received: this.parseContentGetPartTypeName(args, typedError.received)
					});
				}
				case Identifiers.PickInvalidOption:
					this.error(LanguageKeys.Commands.Tags.ParsePickInvalidOption, error);
				case Identifiers.SentenceMissingArgument:
					this.error(LanguageKeys.Commands.Tags.ParseSentenceMissingArgument, error);
				case Identifiers.TransformerInvalidFormatter:
					this.error(LanguageKeys.Commands.Tags.ParseTransformerInvalidFormatter, error);
			}
		}
	}

	private parseContentGetPartTypeName(args: SkyraCommand.Args, type: PartType | readonly PartType[]): string {
		if (Array.isArray(type)) {
			return args.t(LanguageKeys.Globals.OrListValue, { value: type.map((v) => this.inlineCode(this.parseContentGetPartTypeName(args, v))) });
		}

		switch (type as PartType) {
			case PartType.Space:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenSpace));
			case PartType.TagStart:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenTagStart));
			case PartType.TagEnd:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenTagEnd));
			case PartType.Equals:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenEquals));
			case PartType.Colon:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenColon));
			case PartType.Pipe:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenPipe));
			case PartType.Literal:
				return this.inlineCode(args.t(LanguageKeys.Commands.Tags.ParseTokenLiteral));
		}
	}

	private inlineCode(content: string) {
		return `\`${content}\``;
	}

	private parseColour(args: SkyraCommand.Args) {
		let color = args.getOption('color', 'colour');

		if (color === null) return 0;

		const number = Number(color);
		if (Number.isSafeInteger(number)) return Math.max(Math.min(number, 0xffffff), 0x000000);
		if (this.#kHexlessRegex.test(color)) color = `#${color}`;

		return parseColour(color)?.b10.value ?? 0;
	}
}
