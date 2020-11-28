import { SkyraCommand } from '#lib/structures/SkyraCommand';
import { Inhibitor, KlasaMessage } from 'klasa';

export default class extends Inhibitor {
	public async run(message: KlasaMessage, command: SkyraCommand) {
		if (Reflect.has(command, 'inhibit') && (await command.inhibit(message))) throw true;
	}
}
