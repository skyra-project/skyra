import { AnalyticsListener } from '#lib/structures';
import { Actions, Events, Points, Tags, TwitchStreamStatus } from '#lib/types';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AnalyticsListener.Options>({ event: Events.TwitchStreamHookedAnalytics })
export class UserAnalyticsEvent extends AnalyticsListener {
	public run(status: TwitchStreamStatus) {
		return this.writePoint(
			new Point(Points.TwitchSubscriptionHook)
				.tag(Tags.Action, status === TwitchStreamStatus.Online ? Actions.Addition : Actions.Subtraction)
				.tag(Tags.TwitchStreamStatus, status)
				.intField('filler', 1)
		);
	}
}
