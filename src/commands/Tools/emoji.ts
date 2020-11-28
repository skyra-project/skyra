import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { fetch, FetchResultTypes, twemoji } from '#utils/util';
import { CommandStore, KlasaMessage } from 'klasa';

const REG_EMOJI = /^<a?:\w{2,32}:\d{17,21}>$/;
const REG_TWEMOJI = /^[^a-zA-Z0-9]{1,11}$/;
const MAX_EMOJI_SIZE = 1024 * 1024 * 8;

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['emote'],
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Tools.EmojiDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Tools.EmojiExtended),
			requiredPermissions: ['ATTACH_FILES'],
			usage: '<emoji:string>'
		});
	}

	public async run(message: KlasaMessage, [emoji]: [string]) {
		const language = await message.fetchLanguage();

		if (REG_EMOJI.test(emoji)) {
			const [, animated, emojiName, emojiID] = /^<(a)?:(\w{2,32}):(\d{17,21})>$/.exec(emoji)!;
			return message.send(language.get(LanguageKeys.Commands.Tools.EmojiCustom, { emoji: emojiName, id: emojiID }), {
				files: [{ attachment: `https://cdn.discordapp.com/emojis/${emojiID}.${animated ? 'gif' : 'png'}` }]
			});
		}

		if (!REG_TWEMOJI.test(emoji)) throw language.get(LanguageKeys.Commands.Tools.EmojiInvalid);
		const r = twemoji(emoji);
		const buffer = await fetch(`https://twemoji.maxcdn.com/72x72/${r}.png`, FetchResultTypes.Buffer).catch(() => {
			throw language.get(LanguageKeys.Commands.Tools.EmojiInvalid);
		});

		if (buffer.byteLength >= MAX_EMOJI_SIZE) throw language.get(LanguageKeys.Commands.Tools.EmojiTooLarge, { emoji });

		return message.send(language.get(LanguageKeys.Commands.Tools.EmojiTwemoji, { emoji, id: r }), {
			files: [{ attachment: buffer, name: `${r}.png` }]
		});
	}
}
