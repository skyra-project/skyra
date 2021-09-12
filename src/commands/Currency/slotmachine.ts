import { Slotmachine } from '#lib/games/Slotmachine';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord-api-types/payloads/v9';
import { send } from '@sapphire/plugin-editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['slot', 'slots', 'slotmachines'],
	description: LanguageKeys.Commands.Games.SlotMachineDescription,
	extendedHelp: LanguageKeys.Commands.Games.SlotMachineExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const { users } = this.container.db;
		const wager = await args.pick('shinyWager');
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			this.error(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new Slotmachine(message, wager, settings).run();
		const content = args.t(LanguageKeys.Commands.Games.BalanceDifference, { previous: balance, next: amount });
		return send(message, { content, files: [{ attachment, name: 'slots.png' }] });
	}
}
