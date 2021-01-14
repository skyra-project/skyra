import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { fetch, FetchResultTypes, twemoji } from '#utils/util';
import { Message } from 'discord.js';
import { CommandStore } from 'klasa';

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/;
const REG_TWEMOJI = /^[^a-zA-Z0-9]{1,11}$/;
const MAX_EMOJI_SIZE = 1024 * 1024 * 8;

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['emote'],
			cooldown: 10,
			description: LanguageKeys.Commands.Tools.EmojiDescription,
			extendedHelp: LanguageKeys.Commands.Tools.EmojiExtended,
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<emoji:string>'
		});
	}

	public async run(message: Message, [emoji]: [string]) {
		const t = await message.fetchT();

		if (REG_EMOJI.test(emoji)) {
			const [, animated, emojiName, emojiID] = /^<(a)?:(\w{2,32}):(\d{17,21})>$/.exec(emoji)!;
			return message.send(t(LanguageKeys.Commands.Tools.EmojiCustom, { emoji: emojiName, id: emojiID }), {
				files: [{ attachment: `https://cdn.discordapp.com/emojis/${emojiID}.${animated ? 'gif' : 'png'}` }]
			});
		}

		if (!REG_TWEMOJI.test(emoji)) throw t(LanguageKeys.Commands.Tools.EmojiInvalid);
		const r = twemoji(emoji);
		const buffer = await fetch(`https://twemoji.maxcdn.com/72x72/${r}.png`, FetchResultTypes.Buffer).catch(() => {
			throw t(LanguageKeys.Commands.Tools.EmojiInvalid);
		});

		if (buffer.byteLength >= MAX_EMOJI_SIZE) throw t(LanguageKeys.Commands.Tools.EmojiTooLarge, { emoji });

		return message.send(t(LanguageKeys.Commands.Tools.EmojiTwemoji, { emoji, id: r }), {
			files: [{ attachment: buffer, name: `${r}.png` }]
		});
	}
}
