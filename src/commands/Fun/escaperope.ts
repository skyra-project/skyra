import { SkyraCommand, SkyraCommandOptions } from '@lib/structures/SkyraCommand';
import { ApplyOptions } from '@skyra/decorators';
import { KlasaMessage } from 'klasa';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['escape'],
	bucket: 2,
	cooldown: 60,
	description: language => language.tget('COMMAND_ESCAPEROPE_DESCRIPTION'),
	extendedHelp: language => language.tget('COMMAND_ESCAPEROPE_EXTENDED')
})
export default class extends SkyraCommand {

	private readonly kEscapeGif = 'https://cdn.skyra.pw/img/pokemon/escape_rope.gif';

	public async run(message: KlasaMessage) {
		if (message.deletable) await message.nuke().catch(() => null);
		return message.sendLocale('COMMAND_ESCAPEROPE_OUTPUT', [message.author, this.kEscapeGif]);
	}

}
