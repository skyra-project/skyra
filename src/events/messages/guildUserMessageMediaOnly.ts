import { GuildSettings, readSettings } from '#lib/database';
import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { deleteMessage, isModerator } from '#utils/functions';
import { MEDIA_EXTENSION } from '#utils/util';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.GuildUserMessage })
export class UserEvent extends Event {
	public async run(message: GuildMessage) {
		const channels = await readSettings(message.guild, GuildSettings.Channels.MediaOnly);

		// If the message is not set up as media-only, skip:
		if (!channels.includes(message.channel.id)) return;

		// If the message cannot be deleted, skip:
		if (!message.deletable) return;

		// If the member is a moderator, skip:
		if (await isModerator(message.member)) return;

		// If the message has media attachments, skip:
		if (this.hasMediaAttachments(message)) return;

		// - It's a media-only channel.
		// - The message is deletable.
		// - The member is not a moderator.
		// - It does not have media attachments.
		// ...
		// Delete message!
		await deleteMessage(message);
	}

	private hasMediaAttachments(message: GuildMessage) {
		return message.attachments.some((att) => MEDIA_EXTENSION.test(att.url));
	}
}
