import { DbSet } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import type { Message, User } from 'discord.js';

@ApplyOptions<SkyraCommand.Options>({
	aliases: ['bal', 'credits'],
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.BalanceDescription,
	extendedHelp: LanguageKeys.Commands.Social.BalanceExtended,
	usage: '[user:username]',
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: Message, [user = message.author]: [User]) {
		const t = await message.fetchT();
		if (user.bot) throw t(LanguageKeys.Commands.Social.BalanceBots);

		const { users } = await DbSet.connect();
		const money = (await users.findOne(user.id))?.money ?? 0;

		return message.author === user
			? message.send(t(LanguageKeys.Commands.Social.BalanceSelf, { amount: money }))
			: message.send(t(LanguageKeys.Commands.Social.Balance, { user: user.username, amount: money }));
	}
}
