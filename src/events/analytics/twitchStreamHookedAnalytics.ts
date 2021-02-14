import { AnalyticsEvent } from '#lib/structures';
import { AnalyticsSchema } from '#lib/types/AnalyticsSchema';
import { Events } from '#lib/types/Enums';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({
	event: Events.TwitchStreamHookedAnalytics
})
export class UserAnalyticsEvent extends AnalyticsEvent {
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
