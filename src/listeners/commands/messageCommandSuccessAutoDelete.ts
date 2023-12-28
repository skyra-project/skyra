import { GuildSettings, readSettings } from '#lib/database';
import { isGuildMessage } from '#utils/common';
import { deleteMessage } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type MessageCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.MessageCommandSuccess })
export class UserListener extends Listener<typeof Events.MessageCommandSuccess> {
	public async run({ message }: MessageCommandSuccessPayload) {
		if (!isGuildMessage(message)) return;

		const commandAutoDelete = await readSettings(message.guild, GuildSettings.CommandAutoDelete);
		const commandAutoDeleteEntry = commandAutoDelete.find(([id]) => id === message.channel.id);
		if (commandAutoDeleteEntry && message.deletable) {
			await deleteMessage(message, commandAutoDeleteEntry[1]);
		}
	}
}
