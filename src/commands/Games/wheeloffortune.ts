import { DbSet } from '@lib/database';
import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Emojis } from '@utils/constants';
import { WheelOfFortune } from '@utils/Games/WheelOfFortune';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['wof'],
	cooldown: 10,
	description: (language) => language.get(LanguageKeys.Commands.Games.WheelOfFortuneDescription),
	extendedHelp: (language) => language.get(LanguageKeys.Commands.Games.WheelOfFortuneExtended),
	requiredPermissions: ['ATTACH_FILES'],
	usage: '<wager:wager>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [wager]: [number]) {
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			throw await message.fetchLocale(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new WheelOfFortune(message, wager, settings).run();
		const titles = await message.fetchLocale(LanguageKeys.Commands.Games.WheelOfFortuneTitles);

		return message.sendMessage(
			[`**${titles.previous}:** ${balance} ${Emojis.Shiny}`, `**${titles.new}:** ${amount} ${Emojis.Shiny}`].join('\n'),
			{ files: [{ attachment, name: 'wof.png' }] }
		);
	}
}
