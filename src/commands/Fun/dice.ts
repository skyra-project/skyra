import { CommandStore, KlasaMessage, util } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';

export default class extends SkyraCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 5,
			description: language => language.tget('COMMAND_DICE_DESCRIPTION'),
			extendedHelp: language => language.tget('COMMAND_DICE_EXTENDED'),
			usage: '(rolls:rolls) (sides:sides)',
			usageDelim: ' '
		});

		this.createCustomResolver('rolls', (arg, _, msg) => {
			if (!arg) return undefined;
			const n = Number(arg);
			if (util.isNumber(n) || n < 1 || n > 1024) throw msg.language.tget('COMMAND_DICE_ROLLS_ERROR');
			return n | 0;
		}).createCustomResolver('sides', (arg, _, msg) => {
			if (!arg) return undefined;
			const n = Number(arg);
			if (util.isNumber(n) || n < 4 || n > 1024) throw msg.language.tget('COMMAND_DICE_SIDES_ERROR');
			return n | 0;
		});
		this.spam = true;
	}

	public run(message: KlasaMessage, [rl = 1, sd = 6]: [number?, number?]) {
		return message.sendLocale('COMMAND_DICE_OUTPUT', [sd, rl, this.roll(rl, sd)]);
	}

	private roll(rolls: number, sides: number) {
		return Math.ceil(Math.random() * sides * rolls);
	}

}
