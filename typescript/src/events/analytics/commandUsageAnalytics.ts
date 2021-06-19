import { AnalyticsEvent } from '#lib/structures';
import { Actions, CommandCategoryTypes, Points, Tags } from '#lib/types/AnalyticsSchema';
import { Events } from '#lib/types/Enums';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({
	event: Events.CommandUsageAnalytics
})
export class UserAnalyticsEvent extends AnalyticsEvent {
	public run(commandName: string, category: string, subCategory: string) {
		const command = new Point(Points.Commands)
			.tag(Tags.Action, Actions.Addition)
			.tag(CommandCategoryTypes.Category, category)
			.tag(CommandCategoryTypes.SubCategory, subCategory)
			.intField(commandName.replace(/^time$/, 'case-time'), 1);

		return this.writePoint(command);
	}
}
