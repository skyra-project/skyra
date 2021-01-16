import { DbSet, UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import type { User } from 'discord.js';
import type { TFunction } from 'i18next';
import type { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: LanguageKeys.Commands.Social.PayDescription,
			extendedHelp: LanguageKeys.Commands.Social.PayExtended,
			runIn: ['text'],
			spam: true,
			usage: '<amount:integer> <user:user>',
			usageDelim: ' '
		});
	}

	public async run(message: GuildMessage, [money, user]: [number, User]) {
		const t = await message.fetchT();
		if (message.author === user) throw t(LanguageKeys.Commands.Social.PaySelf);
		if (user.bot) return message.send(t(LanguageKeys.Commands.Social.SocialPayBot));

		if (money <= 0) throw t(LanguageKeys.Resolvers.PositiveAmount);

		const { users } = await DbSet.connect();
		const response = await users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const settings = await users.ensure(authorID);

			const currencyBeforePrompt = settings.money;
			if (currencyBeforePrompt < money) throw t(LanguageKeys.Commands.Social.PayMissingMoney, { needed: money, has: currencyBeforePrompt });

			const accepted = await message.ask(t(LanguageKeys.Commands.Social.PayPrompt, { user: user.username, amount: money }));

			await settings.reload();
			const currencyAfterPrompt = settings.money;
			if (currencyAfterPrompt < money) throw t(LanguageKeys.Commands.Social.PayMissingMoney, { needed: money, has: currencyBeforePrompt });

			if (!accepted) return this.denyPayment(t);

			await users.manager.transaction(async (em) => {
				settings.money -= money;
				await em.save(settings);

				const previousEntry = await em.findOne(UserEntity, targetID);
				if (previousEntry) {
					previousEntry.money += money;
					await em.save(previousEntry);
				} else {
					await em.insert(UserEntity, {
						id: targetID,
						money
					});
					this.client.emit(Events.MoneyTransaction, user, money, 0);
				}
			});

			return this.acceptPayment(message, t, user, money);
		});

		return message.send(response);
	}

	private acceptPayment(message: GuildMessage, t: TFunction, user: User, money: number) {
		this.client.emit(Events.MoneyPayment, message, message.author, user, money);
		return t(LanguageKeys.Commands.Social.PayPromptAccept, { user: user.username, amount: money });
	}

	private denyPayment(t: TFunction) {
		return t(LanguageKeys.Commands.Social.PayPromptDeny);
	}
}
