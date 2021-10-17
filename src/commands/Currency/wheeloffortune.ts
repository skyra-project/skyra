import { WheelOfFortune } from '#lib/games/WheelOfFortune';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';
import { PermissionFlagsBits } from 'discord-api-types/v9';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['wof'],
	description: LanguageKeys.Commands.Games.WheelOfFortuneDescription,
	detailedDescription: LanguageKeys.Commands.Games.WheelOfFortuneExtended,
	requiredClientPermissions: [PermissionFlagsBits.AttachFiles]
})
export class UserCommand extends SkyraCommand {
	public async messageRun(message: Message, args: SkyraCommand.Args) {
		const { users } = this.container.db;
		const wager = await args.pick('shinyWager');
		const settings = await users.ensureProfile(message.author.id);
		const balance = settings.money;
		if (balance < wager) {
			this.error(LanguageKeys.Commands.Games.GamesNotEnoughMoney, { money: balance });
		}

		const [attachment, amount] = await new WheelOfFortune(message, wager, settings).run();

		const content = args.t(LanguageKeys.Commands.Games.BalanceDifference, { previous: balance, next: amount });
		return send(message, { content, files: [{ attachment, name: 'wof.png' }] });
	}
}
