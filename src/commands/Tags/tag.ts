import { getFromId, InvalidTypeError, parseParameter } from '#lib/customCommands';
import { CustomCommand, GuildSettings, readSettings, writeSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraPaginatedMessage } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { RequiresLevel } from '#utils/decorators';
import { getColor, getTerylInviteComponentRow, sendLoadingMessage } from '#utils/util';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { chunk, codeBlock } from '@sapphire/utilities';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import { MessageEmbed, MessageOptions } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['tags', 'custom-command', 'copy-pasta'],
	description: LanguageKeys.Commands.Tags.TagDescription,
	detailedDescription: LanguageKeys.Commands.Tags.TagExtended,
	flags: ['embed'],
	options: ['color', 'colour'],
	requiredClientPermissions: [PermissionFlagsBits.ManageMessages],
	runIn: [CommandOptionsRunTypeEnum.GuildAny],
	subCommands: [
		{ input: 'add', output: 'deprecated' },
		{ input: 'alias', output: 'deprecated' },
		'remove',
		{ input: 'edit', output: 'deprecated' },
		{ input: 'rename', output: 'deprecated' },
		'source',
		'list',
		'reset',
		{ input: 'show', default: true }
	]
})
export class UserCommand extends SkyraCommand {
	@RequiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Tags.TagPermissionLevel)
	public async remove(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();

		await writeSettings(message.guild, (settings) => {
			const tags = settings[GuildSettings.CustomCommands];
			const tagIndex = tags.findIndex((command) => command.id === id);
			if (tagIndex === -1) this.error(LanguageKeys.Commands.Tags.TagNotExists, { tag: id });

			settings[GuildSettings.CustomCommands].splice(tagIndex, 1);
		});

		const content = args.t(LanguageKeys.Commands.Tags.TagRemoved, { name: id });
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}

	@RequiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Tags.TagPermissionLevel)
	public async reset(message: GuildMessage, args: SkyraCommand.Args) {
		await writeSettings(message.guild, (settings) => {
			settings[GuildSettings.CustomCommands].length = 0;
		});

		const content = args.t(LanguageKeys.Commands.Tags.TagReset);
		return send(message, content);
	}

	@RequiresLevel(PermissionLevels.Moderator, LanguageKeys.Commands.Tags.TagPermissionLevel)
	public async deprecated(message: GuildMessage, args: SkyraCommand.Args) {
		const content = args.t(LanguageKeys.Commands.Tags.Deprecated);
		return send(message, { content, components: [getTerylInviteComponentRow()] });
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async list(message: GuildMessage, args: SkyraCommand.Args) {
		// Get tags, prefix, and language
		const [tags, prefix] = await readSettings(message.guild, [GuildSettings.CustomCommands, GuildSettings.Prefix]);
		if (!tags.length) this.error(LanguageKeys.Commands.Tags.TagListEmpty);

		const response = await sendLoadingMessage(message, args.t);

		// Get prefix and display all tags
		const display = new SkyraPaginatedMessage({ template: new MessageEmbed().setColor(getColor(message)) });

		// Add all pages, containing 30 tags each
		for (const page of chunk(tags, 30)) {
			const description = `\`${page.map((command) => `${prefix}${command.id}`).join('`, `')}\``;
			display.addPageEmbed((embed) => embed.setDescription(description));
		}

		// Run the display
		await display.run(response, message.author);
		return response;
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	public async show(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const tags = await readSettings(message.guild, GuildSettings.CustomCommands);
		const tag = getFromId(id, tags);
		if (tag === null) return null;

		return send(message, await this.getShowOptions(args, tag));
	}

	public async source(message: GuildMessage, args: SkyraCommand.Args) {
		const id = (await args.pick('string')).toLowerCase();
		const tags = await readSettings(message.guild, GuildSettings.CustomCommands);
		const tag = getFromId(id, tags);
		if (tag === null) return null;

		const content = codeBlock('md', tag.content.toString());
		return send(message, { content, allowedMentions: { users: [], roles: [] } });
	}

	private async getShowOptions(args: SkyraCommand.Args, tag: CustomCommand): Promise<MessageOptions> {
		const allowedMentions = new Set<string>();
		const iterator = tag.content.run();
		let result = iterator.next();
		while (!result.done) result = iterator.next(await parseParameter(args, result.value.type as InvalidTypeError.Type, allowedMentions));

		const content = result.value.trim();
		if (tag.embed) {
			const embed = new MessageEmbed().setDescription(content).setColor(tag.color);
			return { embeds: [embed] };
		}

		return { content, allowedMentions: { users: [...allowedMentions], roles: [] } };
	}
}
