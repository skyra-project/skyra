import { DbSet } from '#lib/database';
import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { User } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['bal', 'credits'],
			bucket: 2,
			cooldown: 10,
			description: LanguageKeys.Commands.Social.BalanceDescription,
			extendedHelp: LanguageKeys.Commands.Social.BalanceExtended,
			usage: '[user:username]',
			spam: true
		});
	}

	public async run(message: KlasaMessage, [user = message.author]: [User]) {
		const t = await message.fetchT();
		if (user.bot) throw t(LanguageKeys.Commands.Social.BalanceBots);

		const { users } = await DbSet.connect();
		const money = (await users.findOne(user.id))?.money ?? 0;

		return message.author === user
			? message.send(t(LanguageKeys.Commands.Social.BalanceSelf, { amount: money }))
			: message.send(t(LanguageKeys.Commands.Social.Balance, { user: user.username, amount: money }));
	}
}
