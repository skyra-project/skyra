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
	permissions: ['ATTACH_FILES']
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { users } = this.context.db;
		const wager = await args.pick('shinyWager');
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			this.error(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new Slotmachine(message, wager, settings).run();
		return message.send(args.t(LanguageKeys.Commands.Games.BalanceDifference, { previous: balance, next: amount }), {
			files: [{ attachment, name: 'slots.png' }]
		});
	}
}
