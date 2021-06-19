import { AnalyticsEvent } from '#lib/structures';
import { Actions, Points, Tags, TwitchStreamStatus } from '#lib/types/AnalyticsSchema';
import { Events } from '#lib/types/Enums';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({
	event: Events.TwitchStreamHookedAnalytics
})
export class UserAnalyticsEvent extends AnalyticsEvent {
	public run(status: TwitchStreamStatus) {
		return this.writePoint(
			new Point(Points.TwitchSubscriptionHook)
				.tag(Tags.Action, status === TwitchStreamStatus.Online ? Actions.Addition : Actions.Subtraction)
				.tag(Tags.TwitchStreamStatus, status)
				.intField('filler', 1)
		);
	}
}
