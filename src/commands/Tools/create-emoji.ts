import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { EmojiRegex } from '@sapphire/discord.js-utilities';
import { Args } from '@sapphire/framework';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['add-emoji'],
	cooldown: 10,
	runIn: ['text'],
	permissionLevel: PermissionLevels.Moderator,
	permissions: ['MANAGE_EMOJIS'],
	description: LanguageKeys.Commands.Tools.CreateEmojiDescription,
	extendedHelp: LanguageKeys.Commands.Tools.CreateEmojiExtended
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const emojiData = await args.pick(UserCommand.emojiResolver);
		if ([...message.guild!.emojis.cache.values()].some((emoji) => emoji.name === emojiData.name))
			return this.error(LanguageKeys.Commands.Tools.CreateEmojisDuplicate, { name: emojiData.name });

		try {
			const emoji = await message.guild!.emojis.create(
				`https://cdn.discordapp.com/emojis/${emojiData.id}.${emojiData.animated ? 'gif' : 'png'}`,
				emojiData.name
			);
			return message.sendTranslated(LanguageKeys.Commands.Tools.CreateEmojiSuccess, [{ emoji: emoji.toString() }]);
		} catch {
			return this.error(LanguageKeys.Commands.Tools.CreateEmojiInvalidEmoji);
		}
	}

	public static emojiResolver = Args.make<EmojiData>((parameter, { argument }) => {
		const match = EmojiRegex.exec(parameter);
		return match && match.groups
			? Args.ok({ id: match.groups.id, name: match.groups.name, animated: Boolean(match.groups.animated) })
			: Args.error({ parameter, argument, identifier: LanguageKeys.Commands.Tools.CreateEmojiInvalidDiscordEmoji });
	});
}

interface EmojiData {
	id: string;
	name: string;
	animated: boolean;
}
