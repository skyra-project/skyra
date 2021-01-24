import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Duration } from '@sapphire/time-utilities';
import { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export class UserArgument extends Argument {
	public async run(arg: string, possible: Possible, message: Message): Promise<Date> {
		const date = new Duration(arg).fromNow;
		if (!isNaN(date.getTime()) && date.getTime() > Date.now()) return date;
		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidDuration, { name: possible.name });
	}
}
