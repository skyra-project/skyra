import { LanguageKeys } from '@lib/types/namespaces/LanguageKeys';
import { ApplyOptions } from '@skyra/decorators';
import { Argument, ArgumentOptions, KlasaMessage, Possible } from 'klasa';

/** Identical implementation as restString from Klasa, but for overwatchplayer */
@ApplyOptions<ArgumentOptions>({
	name: '...overwatchplayer'
})
export default class extends Argument {
	public get baseArg() {
		return this.store.get('overwatchplayer')!;
	}

	public run(arg: string, possible: Possible, message: KlasaMessage): string {
		if (!arg) throw message.language.get(LanguageKeys.Commands.GameIntegration.OverwatchInvalidPlayerName, { playerTag: arg });
		// eslint-disable-next-line dot-notation
		const {
			args,
			usage: { usageDelim }
		} = message['prompter']!;
		const index = args.indexOf(arg);
		const rest = args.splice(index, args.length - index).join(usageDelim!);
		args.push(rest);
		return this.baseArg.run(rest, possible, message);
	}
}
