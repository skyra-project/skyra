import { Events } from '#lib/types/Enums';
import { AnalyticsSchema } from '#utils/Tracking/Analytics/AnalyticsSchema';
import { AnalyticsEvent } from '#utils/Tracking/Analytics/structures/AnalyticsEvent';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@skyra/decorators';
import { EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({
	event: Events.TwitchStreamHookedAnalytics
})
export default class extends AnalyticsEvent {
	public run(status: AnalyticsSchema.TwitchStreamStatus) {
		return this.writePoint(
			new Point(AnalyticsSchema.Points.TwitchSubscriptionHook)
				.tag(
					AnalyticsSchema.Tags.Action,
					status === AnalyticsSchema.TwitchStreamStatus.Online ? AnalyticsSchema.Actions.Addition : AnalyticsSchema.Actions.Subtraction
				)
				.tag(AnalyticsSchema.Tags.TwitchStreamStatus, status)
				.intField('filler', 1)
		);
	}
}
