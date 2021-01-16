import type { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import type { Message } from 'discord.js';
import { Inhibitor } from 'klasa';

export default class extends Inhibitor {
	public async run(message: Message, command: SkyraCommand) {
		if (Reflect.has(command, 'inhibit') && (await command.inhibit(message))) throw true;
	}
}
