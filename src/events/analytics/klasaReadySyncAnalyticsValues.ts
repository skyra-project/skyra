import { Point } from '@influxdata/influxdb-client';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { AnalyticsEvent } from '@utils/Tracking/Analytics/structures/AnalyticsEvent';
import { EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({
	event: Events.KlasaReady
})
export default class extends AnalyticsEvent {

	public run() {
		this.writePoints([
			this.syncGuilds(),
			this.syncUsers()
		]);

		return this.analytics.flush();
	}

	private syncGuilds() {
		return new Point('guilds')
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			// TODO: Adjust for traditional sharding
			.intField('value', this.client.guilds.size);
	}

	private syncUsers() {
		return new Point('users')
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			// TODO: Adjust for traditional sharding
			.intField('value', this.client.guilds.reduce((acc, val) => acc + val.memberCount, 0));
	}

}
