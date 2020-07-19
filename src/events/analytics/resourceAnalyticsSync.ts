import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { AnalyticsEvent } from '@utils/Tracking/Analytics/structures/AnalyticsEvent';
import { EventOptions } from 'klasa';
import { Point } from '@influxdata/influxdb-client';
import { roundNumber } from '@utils/util';
import { cpus } from 'os';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';

@ApplyOptions<EventOptions>({
	event: Events.ResourceAnalyticsSync
})
export default class extends AnalyticsEvent {

	public run() {
		this.writePoints([
			this.syncTotalCPULoad()
		]);

		return this.analytics.flush();
	}

	private syncTotalCPULoad() {
		const perCoreLoad = cpus().map(({ times }) => roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100);
		return new Point(AnalyticsSchema.Points.TotalCPULoad)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			.intField('value', perCoreLoad.reduce((acc, val) => acc + val, 0) / perCoreLoad.length);
	}

}
