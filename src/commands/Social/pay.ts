import { UserEntity } from '@lib/database/entities/UserEntity';
import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { GuildMessage } from '@lib/types';
import { Events } from '@lib/types/Enums';
import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { User } from 'discord.js';
import { CommandStore } from 'klasa';
import { getManager } from 'typeorm';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: (language) => language.get(LanguageKeys.Commands.Social.PayDescription),
			extendedHelp: (language) => language.get(LanguageKeys.Commands.Social.PayExtended),
			runIn: ['text'],
			spam: true,
			usage: '<amount:integer> <user:user>',
			usageDelim: ' '
		});
	}

	public async run(message: GuildMessage, [money, user]: [number, User]) {
		const language = await message.fetchLanguage();
		if (message.author === user) throw language.get(LanguageKeys.Commands.Social.PaySelf);
		if (user.bot) return message.sendLocale(LanguageKeys.Commands.Social.SocialPayBot);

		if (money <= 0) throw language.get(LanguageKeys.Resolvers.PositiveAmount);

		const { users } = await DbSet.connect();
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const settings = await users.ensure(authorID);

			const currencyBeforePrompt = settings.money;
			if (currencyBeforePrompt < money)
				throw language.get(LanguageKeys.Commands.Social.PayMissingMoney, { needed: money, has: currencyBeforePrompt });

			const accepted = await message.ask(language.get(LanguageKeys.Commands.Social.PayPrompt, { user: user.username, amount: money }));

			await settings.reload();
			const currencyAfterPrompt = settings.money;
			if (currencyAfterPrompt < money)
				throw language.get(LanguageKeys.Commands.Social.PayMissingMoney, { needed: money, has: currencyBeforePrompt });

			if (!accepted) return this.denyPayment(message);

			await getManager().transaction(async (em) => {
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

			return this.acceptPayment(message, user, money);
		});
	}

	private async acceptPayment(message: GuildMessage, user: User, money: number) {
		this.client.emit(Events.MoneyPayment, message, message.author, user, money);
		return message.sendMessage(message.fetchLocale(LanguageKeys.Commands.Social.PayPromptAccept, { user: user.username, amount: money }));
	}

	private async denyPayment(message: GuildMessage) {
		return message.sendMessage(message.fetchLocale(LanguageKeys.Commands.Social.PayPromptDeny));
	}
}
