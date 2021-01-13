import { DbSet } from '#lib/database';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WheelOfFortune } from '#lib/games/WheelOfFortune';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['wof'],
	cooldown: 10,
	description: LanguageKeys.Commands.Games.WheelOfFortuneDescription,
	extendedHelp: LanguageKeys.Commands.Games.WheelOfFortuneExtended,
	requiredPermissions: ['ATTACH_FILES'],
	usage: '<wager:wager>'
})
export default class extends SkyraCommand {
	public async run(message: Message, [wager]: [number]) {
		const t = await message.fetchT();
		const { users } = await DbSet.connect();
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			throw t(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new WheelOfFortune(message, wager, settings).run();
		return message.send(t(LanguageKeys.Commands.Games.BalanceDifference, { previous: balance, next: amount }), {
			files: [{ attachment, name: 'wof.png' }]
		});
	}
}
