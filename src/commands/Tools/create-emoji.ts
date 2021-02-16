import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { EmojiRegex } from '@sapphire/discord.js-utilities';
import { Args } from '@sapphire/framework';

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
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const { animated, id, name } = await args.pick(UserCommand.emojiResolver);

		if (message.guild.emojis.cache.some((emoji) => emoji.name === name))
			return this.error(LanguageKeys.Commands.Tools.CreateEmojisDuplicate, { name });

		try {
			const emoji = await message.guild.emojis.create(`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`, name);
			return message.send(args.t(LanguageKeys.Commands.Tools.CreateEmojiSuccess, { emoji: emoji.toString() }));
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
