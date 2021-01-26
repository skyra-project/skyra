import { DbSet } from '#lib/database';
import { WheelOfFortune } from '#lib/games/WheelOfFortune';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['wof'],
	cooldown: 10,
	description: LanguageKeys.Commands.Games.WheelOfFortuneDescription,
	extendedHelp: LanguageKeys.Commands.Games.WheelOfFortuneExtended,
	requiredPermissions: ['ATTACH_FILES'],
	usage: '<wager:wager>'
})
export class UserCommand extends SkyraCommand {
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
