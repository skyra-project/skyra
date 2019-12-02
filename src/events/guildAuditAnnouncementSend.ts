import { EventStore, KlasaMessage } from 'klasa';
import { AuditMeasurements, AuditAnnouncementAction } from '../lib/types/influxSchema/Audit';
import { Role, TextChannel } from 'discord.js';
import AuditEvent from '../lib/structures/AuditEvent';
import { Events } from '../lib/types/Enums';

export default class extends AuditEvent {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			event: Events.GuildAnnouncementSend
		});
	}

	public async run(message: KlasaMessage, resultMessage: KlasaMessage, channel: TextChannel, role: Role, content: string) {
		return this.writePoint(AuditMeasurements.Announcement, [
			{
				fields: {
					content,
					role_id: role.id,
					role_name: role.name,
					message_source_id: message.id,
					message_result_id: resultMessage.id
				},
				tags: {
					shard: (this.client.options.shards as number[])[0].toString(),
					user_id: message.author.id,
					guild_id: message.guild?.id!,
					channel_id: channel.id,
					action: AuditAnnouncementAction.Send
				}
			}
		]);
	}

}
