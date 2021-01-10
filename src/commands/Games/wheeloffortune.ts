import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Emojis } from '#utils/constants';
import { WheelOfFortune } from '#utils/Games/WheelOfFortune';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['wof'],
	cooldown: 10,
	description: LanguageKeys.Commands.Games.WheelOfFortuneDescription,
	extendedHelp: LanguageKeys.Commands.Games.WheelOfFortuneExtended,
	requiredPermissions: ['ATTACH_FILES'],
	usage: '<wager:wager>'
})
export default class extends SkyraCommand {
	public async run(message: KlasaMessage, [wager]: [number]) {
		const t = await message.fetchT();
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			throw t(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new WheelOfFortune(message, wager, settings).run();
		const titles = t(LanguageKeys.Commands.Games.WheelOfFortuneTitles, { returnObjects: true });

		return message.send([`**${titles.previous}:** ${balance} ${Emojis.Shiny}`, `**${titles.new}:** ${amount} ${Emojis.Shiny}`].join('\n'), {
			files: [{ attachment, name: 'wof.png' }]
		});
	}
}
