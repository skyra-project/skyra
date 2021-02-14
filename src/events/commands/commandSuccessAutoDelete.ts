import { GuildSettings } from '#lib/database';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandSuccessPayload, Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export class UserEvent extends Event<Events.CommandSuccess> {
	public async run({ message }: CommandSuccessPayload) {
		if (!message.guild) return;

		const commandAutodelete = await message.guild.readSettings(GuildSettings.CommandAutoDelete);
		const commandAutodeleteEntry = commandAutodelete.find(([id]) => id === message.channel.id);
		if (commandAutodeleteEntry && message.deletable) {
			await message.nuke(commandAutodeleteEntry[1]);
		}
	}
}
