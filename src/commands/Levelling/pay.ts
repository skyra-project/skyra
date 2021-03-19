import { DbSet, UserEntity } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { User } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<SkyraCommand.Options>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Social.PayDescription,
	extendedHelp: LanguageKeys.Commands.Social.PayExtended,
	runIn: ['text'],
	spam: true
})
export class UserCommand extends SkyraCommand {
	public async run(message: GuildMessage, args: SkyraCommand.Args) {
		const { money, user } = await this.resolveArguments(args);

		if (message.author === user) this.error(LanguageKeys.Commands.Social.PaySelf);
		if (user.bot) return message.send(args.t(LanguageKeys.Commands.Social.SocialPayBot));

		const { users } = this.context.db;
		const response = await users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const settings = await users.ensure(authorID);

			const currencyBeforePrompt = settings.money;
			if (currencyBeforePrompt < money) {
				this.error(LanguageKeys.Commands.Social.PayMissingMoney, { needed: money, has: currencyBeforePrompt });
			}

			const accepted = await message.ask(args.t(LanguageKeys.Commands.Social.PayPrompt, { user: user.username, amount: money }));
			if (!accepted) return this.denyPayment(args.t);

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
					this.context.client.emit(Events.MoneyTransaction, user, money, 0);
				}
			});

			return this.acceptPayment(message, args.t, user, money);
		});

		return message.send(response);
	}

	private async resolveArguments(args: SkyraCommand.Args) {
		const user = await args.pickResult('userName');
		if (user.success) {
			return { money: await args.pick('integer', { minimum: 1 }), user: user.value } as const;
		}

		return { money: await args.pick('integer', { minimum: 1 }), user: await args.pick('userName') } as const;
	}

	private acceptPayment(message: GuildMessage, t: TFunction, user: User, money: number) {
		this.context.client.emit(Events.MoneyPayment, message, message.author, user, money);
		return t(LanguageKeys.Commands.Social.PayPromptAccept, { user: user.username, amount: money });
	}

	private denyPayment(t: TFunction) {
		return t(LanguageKeys.Commands.Social.PayPromptDeny);
	}
}
