import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { Message } from 'discord.js';
import { Inhibitor } from 'klasa';

export default class extends Inhibitor {
	public async run(message: Message, command: SkyraCommand) {
		if (Reflect.has(command, 'inhibit') && (await command.inhibit(message))) throw true;
	}
}
