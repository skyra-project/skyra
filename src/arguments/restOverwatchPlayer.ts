import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import { Argument, ArgumentOptions, Possible } from 'klasa';

/** Identical implementation as restString from Klasa, but for overwatchplayer */
@ApplyOptions<ArgumentOptions>({
	name: '...overwatchplayer'
})
export default class extends Argument {
	public get baseArg() {
		return this.store.get('overwatchplayer')!;
	}

	public async run(arg: string, possible: Possible, message: Message): Promise<string> {
		if (!arg) throw await message.resolveKey(LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlayerName, { playerTag: arg });
		// eslint-disable-next-line dot-notation
		const {
			args,
			usage: { usageDelim }
		} = message.prompter!;
		const index = args.indexOf(arg);
		const rest = args.splice(index, args.length - index).join(usageDelim!);
		args.push(rest);
		return this.baseArg.run(rest, possible, message);
	}
}
