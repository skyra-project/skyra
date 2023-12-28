import { AnalyticsListener } from '#lib/structures';
import { Actions, CommandCategoryTypes, Events, Points, Tags } from '#lib/types';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AnalyticsListener.Options>({ event: Events.CommandUsageAnalytics })
export class UserAnalyticsEvent extends AnalyticsListener {
	public run(commandName: string, category: string) {
		const command = new Point(Points.Commands)
			.tag(Tags.Action, Actions.Addition)
			.tag(CommandCategoryTypes.Category, category)
			.intField(commandName.replace(/^time$/, 'case-time'), 1);

		return this.writePoint(command);
	}
}
