import { DbSet } from '#lib/database';
import { Slotmachine } from '#lib/games/Slotmachine';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['slot', 'slots', 'slotmachines'],
	bucket: 2,
	cooldown: 7,
	description: LanguageKeys.Commands.Games.SlotMachineDescription,
	extendedHelp: LanguageKeys.Commands.Games.SlotMachineExtended,
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

		const [attachment, amount] = await new Slotmachine(message, wager, settings).run();
		return message.send(t(LanguageKeys.Commands.Games.BalanceDifference, { previous: balance, next: amount }), {
			files: [{ attachment, name: 'slots.png' }]
		});
	}
}
