import { EventStore, KlasaMessage } from 'klasa';
import { AuditMeasurements, AuditAnnouncementAction, AuditTags } from '../../lib/types/influxSchema/Audit';
import { Role, TextChannel } from 'discord.js';
import AuditEvent from '../../lib/structures/analytics/AuditEvent';
import { Events } from '../../lib/types/Enums';
import { Tags } from '../../lib/types/influxSchema/tags';

export default class extends AuditEvent {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, {
			event: Events.GuildAnnouncementSend
		});
	}

	public async run(message: KlasaMessage, resultMessage: KlasaMessage, channel: TextChannel, role: Role, content: string) {
		return this.writeMeasurement(AuditMeasurements.Announcement,
			{
				fields: {
					content,
					role_id: role.id,
					role_name: role.name,
					message_source_id: message.id,
					message_result_id: resultMessage.id
				},
				tags: this.formTags({
					[Tags.User]: message.author.id,
					[Tags.Guild]: message.guild?.id!,
					[Tags.Channel]: channel.id,
					[AuditTags.Action]: AuditAnnouncementAction.Send
				})
			});
	}

}
