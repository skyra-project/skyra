import { DbSet } from '@lib/structures/DbSet';
import { SkyraCommand } from '@lib/structures/SkyraCommand';
import { Events } from '@lib/types/Enums';
import { UserEntity } from '@orm/entities/UserEntity';
import { CommandStore, KlasaMessage, KlasaUser } from 'klasa';
import { getManager } from 'typeorm';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: language => language.tget('COMMAND_PAY_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_PAY_EXTENDED'),
			runIn: ['text'],
			spam: true,
			usage: '<amount:integer> <user:user>',
			usageDelim: ' '
		});
	}

	public async run(message: KlasaMessage, [money, user]: [number, KlasaUser]) {
		if (message.author === user) throw message.language.tget('COMMAND_PAY_SELF');
		if (user.bot) return message.sendLocale('COMMAND_SOCIAL_PAY_BOT');

		if (money <= 0) throw message.language.tget('RESOLVER_POSITIVE_AMOUNT');

		const { users } = await DbSet.connect();
		return users.lock([message.author.id, user.id], async (authorID, targetID) => {
			const settings = await users.ensure(authorID);

			const currencyBeforePrompt = settings.money;
			if (currencyBeforePrompt < money) throw message.language.tget('COMMAND_PAY_MISSING_MONEY', money, currencyBeforePrompt);

			const accepted = await message.ask(message.language.tget('COMMAND_PAY_PROMPT', user.username, money));

			await settings.reload();
			const currencyAfterPrompt = settings.money;
			if (currencyAfterPrompt < money) throw message.language.tget('COMMAND_PAY_MISSING_MONEY', money, currencyAfterPrompt);

			if (!accepted) return this.denyPayment(message);

			let authorMoney: number | null = null;
			let userMoney: number | null = null;

			await getManager().transaction(async em => {
				authorMoney = settings.money;
				settings.money -= money;
				await em.save(settings);

				const previousEntry = await em.findOne(UserEntity, targetID);
				if (previousEntry) {
					userMoney = previousEntry.money;
					previousEntry.money += money;
					await em.save(previousEntry);
				} else {
					await em.insert(UserEntity, {
						id: targetID,
						money
					});
				}
			});

			return this.acceptPayment(message, user, money, authorMoney, userMoney);
		});
	}

	private async acceptPayment(message: KlasaMessage, user: KlasaUser, money: number, authorMoney: number | null, userMoney: number | null) {
		this.client.emit(Events.MoneyPayment, message, message.author, user, money);
		if (authorMoney !== null) this.client.emit(Events.MoneyTransaction, message.author, money, authorMoney);
		if (userMoney !== null) this.client.emit(Events.MoneyTransaction, user, money, userMoney);
		return message.alert(message.language.tget('COMMAND_PAY_PROMPT_ACCEPT', user.username, money));
	}

	private denyPayment(message: KlasaMessage) {
		return message.alert(message.language.tget('COMMAND_PAY_PROMPT_DENY'));
	}

}
