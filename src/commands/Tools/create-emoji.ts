import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { EmojiRegex } from '@sapphire/discord.js-utilities';
import { Args, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['add-emoji'],
	description: LanguageKeys.Commands.Tools.CreateEmojiDescription,
	detailedDescription: LanguageKeys.Commands.Tools.CreateEmojiExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredClientPermissions: [PermissionFlagsBits.ManageEmojisAndStickers],
	runIn: [CommandOptionsRunTypeEnum.GuildAny]
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const { animated, id, name } = await args.pick(UserCommand.emojiResolver);

		if (message.guild.emojis.cache.some((emoji) => emoji.name === name))
			return this.error(LanguageKeys.Commands.Tools.CreateEmojisDuplicate, { name });

		try {
			const emoji = await message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`, name);
			const content = args.t(LanguageKeys.Commands.Tools.CreateEmojiSuccess, { emoji: emoji.toString() });
			return send(message, content);
		} catch {
			return this.error(LanguageKeys.Commands.Tools.CreateEmojiInvalidEmoji);
		}
	}

	private static emojiResolver = Args.make<EmojiData>((parameter, { argument }) => {
		const match = EmojiRegex.exec(parameter);
		return match?.groups
			? Args.ok({ id: match.groups.id, name: match.groups.name, animated: Boolean(match.groups.animated) })
			: Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Tools.CreateEmojiInvalidDiscordEmoji });
	});
}

interface EmojiData {
	id: string;
	name: string;
	animated: boolean;
}
