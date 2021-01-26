import { AnalyticsEvent } from '#lib/structures';
import { AnalyticsSchema } from '#lib/types/AnalyticsSchema';
import { Events } from '#lib/types/Enums';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({
	event: Events.CommandUsageAnalytics
})
export default class extends AnalyticsEvent {
	public run(commandName: string, category: string, subCategory: string) {
		const command = new Point(AnalyticsSchema.Points.Commands)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Addition)
			.tag(AnalyticsSchema.CommandCategoryTypes.Category, category)
			.tag(AnalyticsSchema.CommandCategoryTypes.SubCategory, subCategory)
			.intField(commandName.replace(/^time$/, 'case-time'), 1);

		return this.writePoint(command);
	}
}
