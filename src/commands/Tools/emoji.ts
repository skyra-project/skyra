import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { fetch, FetchResultTypes, kRegExpTwemoji, twemoji } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/;
const MAX_EMOJI_SIZE = 1024 * 1024 * 8;

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['emote'],
	cooldown: 10,
	description: LanguageKeys.Commands.Tools.EmojiDescription,
	extendedHelp: LanguageKeys.Commands.Tools.EmojiExtended,
	permissions: ['ATTACH_FILES']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const emoji = await args.pick('string');
		const { t } = args;

		if (REG_EMOJI.test(emoji)) {
			const [, animated, emojiName, emojiID] = /^<(a)?:(\w{2,32}):(\d{17,21})>$/.exec(emoji)!;
			return message.send(t(LanguageKeys.Commands.Tools.EmojiCustom, { emoji: emojiName, id: emojiID }), {
				files: [{ attachment: `https://cdn.discordapp.com/emojis/${emojiID}.${animated ? 'gif' : 'png'}` }]
			});
		}

		if (!kRegExpTwemoji.test(emoji)) this.error(LanguageKeys.Commands.Tools.EmojiInvalid);
		const r = twemoji(emoji);
		const buffer = await fetch(`https://twemoji.maxcdn.com/v/latest/72x72/${r}.png`, FetchResultTypes.Buffer).catch(() => {
			this.error(LanguageKeys.Commands.Tools.EmojiInvalid);
		});

		if (buffer.byteLength >= MAX_EMOJI_SIZE) this.error(LanguageKeys.Commands.Tools.EmojiTooLarge, { emoji });

		return message.send(t(LanguageKeys.Commands.Tools.EmojiTwemoji, { emoji, id: r }), {
			files: [{ attachment: buffer, name: `${r}.png` }]
		});
	}
}
