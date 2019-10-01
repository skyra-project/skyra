import { Inhibitor, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../lib/structures/SkyraCommand';

export default class extends Inhibitor {

	public async run(message: KlasaMessage, command: SkyraCommand) {
		if ('inhibit' in command && await command.inhibit(message)) throw true;
	}

}
