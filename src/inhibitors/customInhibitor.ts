import { Inhibitor, KlasaMessage } from 'klasa';
import { SkyraCommand } from '../lib/structures/SkyraCommand';

export default class extends Inhibitor {

	public async run(message: KlasaMessage, command: SkyraCommand) {
		if (command.inhibit && await command.inhibit(message)) throw true;
	}

}
