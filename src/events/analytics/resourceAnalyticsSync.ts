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
			this.syncPerCoreLoad(),
			this.syncMem()
		]);

		return this.analytics.flush();
	}

	private syncPerCoreLoad() {
		const perCoreLoad = cpus().map(({ times }) => roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10000) / 100);

		const point = new Point(AnalyticsSchema.Points.PerCoreCPULoad)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync);
		perCoreLoad.forEach((val, index) => point.floatField(`cpu_${index}`, val));
		return point;
	}

	private syncMem() {
		const usage = process.memoryUsage();
		return new Point(AnalyticsSchema.Points.Memory)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			.floatField('total', Math.round(100 * (usage.heapTotal / 1048576)) / 100)
			.floatField('used', Math.round(100 * (usage.heapUsed / 1048576)) / 100);
	}

}
