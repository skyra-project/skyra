import { GuildSettings, readSettings } from '#lib/database';
import { Events, type GuildMessage } from '#lib/types';
import { deleteMessage, isMediaAttachment, isModerator } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.GuildUserMessage })
export class UserListener extends Listener {
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
		return message.attachments.some((attachment) => isMediaAttachment(attachment));
	}
}
