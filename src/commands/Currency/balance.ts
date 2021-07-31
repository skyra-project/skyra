import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@skyra/editable-commands';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bal', 'credits'],
	description: LanguageKeys.Commands.Social.BalanceDescription,
	extendedHelp: LanguageKeys.Commands.Social.BalanceExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		if (user.bot) this.error(LanguageKeys.Commands.Social.BalanceBots);

		const { users } = this.container.db;
		const money = (await users.findOne(user.id))?.money ?? 0;
		const content =
			message.author === user
				? args.t(LanguageKeys.Commands.Social.BalanceSelf, { amount: money })
				: args.t(LanguageKeys.Commands.Social.Balance, { user: user.username, amount: money });

		return send(message, content);
	}
}
