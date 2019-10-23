import { CommandOptions, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../../lib/structures/SkyraCommand';
import { ApplyOptions } from '../../lib/util/util';

@ApplyOptions<CommandOptions>({
	bucket: 2,
	cooldown: 60,
	description: language => language.tget('COMMAND_ESCAPEROPE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_ESCAPEROPE_EXTENDED')
})
export default class extends SkyraCommand {

	public async run(message: KlasaMessage) {
		if (message.deletable) await message.nuke().catch(() => null);
		return message.sendLocale('COMMAND_ESCAPEROPE_OUTPUT', [message.author]);
	}

}
