import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { kRegExpTwemoji, twemoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message } from 'discord.js';

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/;
const MAX_EMOJI_SIZE = 1024 * 1024 * 8;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['emote'],
	description: LanguageKeys.Commands.Tools.EmojiDescription,
	extendedHelp: LanguageKeys.Commands.Tools.EmojiExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const emoji = await args.pick('string');

		const { content, name, attachment } = REG_EMOJI.test(emoji) ? this.builtinEmoji(args, emoji) : await this.twemoji(args, emoji);
		return send(message, { content, files: [{ attachment, name }] });
	}

	private builtinEmoji(args: SkyraCommand.Args, emoji: string) {
		const [, animated, emojiName, emojiId] = /^<(a)?:(\w{2,32}):(\d{17,21})>$/.exec(emoji)!;
		const content = args.t(LanguageKeys.Commands.Tools.EmojiCustom, { emoji: emojiName, id: emojiId });
		const name = `${emojiId}.${animated ? 'gif' : 'png'}`;
		const attachment = `https://cdn.discordapp.com/emojis/${name}`;

		return { content, name, attachment } as const;
	}

	private async twemoji(args: SkyraCommand.Args, emoji: string) {
		if (!kRegExpTwemoji.test(emoji)) this.error(LanguageKeys.Commands.Tools.EmojiInvalid);
		const emojiCode = twemoji(emoji);

		const name = `${emojiCode}.png`;
		const attachment = await fetch(`https://twemoji.maxcdn.com/v/latest/72x72/${name}`, FetchResultTypes.Buffer).catch(() => {
			this.error(LanguageKeys.Commands.Tools.EmojiInvalid);
		});
		if (attachment.byteLength >= MAX_EMOJI_SIZE) this.error(LanguageKeys.Commands.Tools.EmojiTooLarge, { emoji });

		const content = args.t(LanguageKeys.Commands.Tools.EmojiTwemoji, { emoji, id: emojiCode });

		return { content, name, attachment } as const;
	}
}
