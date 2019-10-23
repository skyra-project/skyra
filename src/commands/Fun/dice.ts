import { KlasaMessage, util } from 'klasa';
import { SkyraCommand, SkyraCommandOptions } from '../../lib/structures/SkyraCommand';
import { ApplyOptions, CreateResolver } from '../../lib/util/util';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: language => language.tget('COMMAND_DICE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_DICE_EXTENDED'),
	usage: '(rolls:rolls) (sides:sides)',
	usageDelim: ' ',
	spam: true
})
@CreateResolver('rolls', (arg, _, msg) => {
	if (!arg) return undefined;
	const n = Number(arg);
	if (util.isNumber(n) || n < 1 || n > 1024) throw msg.language.tget('COMMAND_DICE_ROLLS_ERROR');
	return n | 0;
})
@CreateResolver('sides', (arg, _, msg) => {
	if (!arg) return undefined;
	const n = Number(arg);
	if (util.isNumber(n) || n < 4 || n > 1024) throw msg.language.tget('COMMAND_DICE_SIDES_ERROR');
	return n | 0;
})
export default class extends SkyraCommand {

	public run(message: KlasaMessage, [rl = 1, sd = 6]: [number?, number?]) {
		return message.sendLocale('COMMAND_DICE_OUTPUT', [sd, rl, this.roll(rl, sd)]);
	}

	private roll(rolls: number, sides: number) {
		return Math.ceil(Math.random() * sides * rolls);
	}

}
