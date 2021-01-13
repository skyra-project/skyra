import { LanguageKeys } from '#lib/types/namespaces/LanguageKeys';
import { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, _: Possible, message: Message) {
		if (/[A-Za-z0-9]+(?:[#-][0-9]{4,5})?/i.test(arg)) return encodeURIComponent(arg.replace('#', '-'));
		throw await message.resolveKey(LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlayerName, { playerTag: arg });
	}
}
