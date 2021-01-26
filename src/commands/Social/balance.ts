import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bal', 'credits'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.BalanceDescription,
	extendedHelp: LanguageKeys.Commands.Social.BalanceExtended,
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: Message, args: SkyraCommand.Args) {
		const user = args.finished ? message.author : await args.pick('userName');
		if (user.bot) throw args.t(LanguageKeys.Commands.Social.BalanceBots);

		const { users } = await DbSet.connect();
		const money = (await users.findOne(user.id))?.money ?? 0;

		return message.send(
			message.author === user
				? args.t(LanguageKeys.Commands.Social.BalanceSelf, { amount: money })
				: args.t(LanguageKeys.Commands.Social.Balance, { user: user.username, amount: money })
		);
	}
}
