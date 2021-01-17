import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { pickRandom } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';

const NUMBER_OPTS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const ALPHABET_OPTS = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹'];

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['spoll'],
	cooldown: 5,
	description: LanguageKeys.Commands.Tools.PollDescription,
	extendedHelp: LanguageKeys.Commands.Tools.PollExtended,
	usage: '<options:string> [...]',
	usageDelim: ',',
	requiredPermissions: ['ADD_REACTIONS', 'READ_MESSAGE_HISTORY']
})
export default class extends SkyraCommand {
	public async run(message: Message, options: string[]) {
		const t = await message.fetchT();

		// since klasa usage is trash
		if (options.length < 2 || options.length > 20) throw t(LanguageKeys.Resolvers.MinmaxBothInclusive, { name: 'options', min: 2, max: 20 });

		const emojis = (options.length > 10 ? ALPHABET_OPTS : NUMBER_OPTS).slice(0, options.length);
		const loadingMsg = await message.send(pickRandom(t(LanguageKeys.System.Loading)));

		for (const emoji of emojis) {
			if (loadingMsg.reactions.cache.size === 20) throw t(LanguageKeys.Commands.Tools.PollReactionLimit);
			await loadingMsg.react(emoji);
		}

		await message.send(options.map((option, i) => `${emojis[i]} → *${option.trim()}*`).join('\n'));
	}
}
