import { GuildSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import type { Message } from 'discord.js';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export default class extends Event {
	public async run(message: Message) {
		if (!message.guild) return;

		const commandAutodelete = await message.guild.readSettings(GuildSettings.CommandAutoDelete);
		const commandAutodeleteEntry = commandAutodelete.find(([id]) => id === message.channel.id);
		if (commandAutodeleteEntry && message.deletable) {
			await message.nuke(commandAutodeleteEntry[1]);
		}
	}
}
