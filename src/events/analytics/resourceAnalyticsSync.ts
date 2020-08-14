import { Point } from '@influxdata/influxdb-client';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { AnalyticsEvent } from '@utils/Tracking/Analytics/structures/AnalyticsEvent';
import { EventOptions } from 'klasa';
import { cpus } from 'os';

@ApplyOptions<EventOptions>({
	event: Events.ResourceAnalyticsSync
})
export default class extends AnalyticsEvent {
	public run() {
		this.writePoints([this.syncPerCoreLoad(), this.syncMem()]);

		return this.analytics.flush();
	}

	private syncPerCoreLoad() {
		const point = new Point(AnalyticsSchema.Points.PerCoreCPULoad).tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync);

		let index = 0;
		for (const { times } of cpus()) point.floatField(`cpu_${index++}`, (times.user + times.nice + times.sys + times.irq) / times.idle);

		return point;
	}

	private syncMem() {
		const usage = process.memoryUsage();
		return new Point(AnalyticsSchema.Points.Memory)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			.floatField('total', usage.heapTotal)
			.floatField('used', usage.heapUsed);
	}
}
