import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export class UserArgument extends Argument {
	public get date() {
		return this.store.get('date') as Argument;
	}

	public get duration() {
		return this.store.get('duration') as Argument;
	}

	public async run(arg: string, possible: Possible, message: Message): Promise<Date> {
		const date: Date = await Promise.resolve()
			.then(() => this.date.run(arg, possible, message))
			.catch(() => this.duration.run(arg, possible, message))
			.catch(() => null);

		if (date && !Number.isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidTime, { name: possible.name });
	}
}
