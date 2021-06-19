import { AnalyticsEvent } from '#lib/structures';
import { Actions, Points, Tags } from '#lib/types/AnalyticsSchema';
import { Events } from '#lib/types/Enums';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import { cpus } from 'os';

@ApplyOptions<EventOptions>({
	event: Events.ResourceAnalyticsSync
})
export class UserAnalyticsEvent extends AnalyticsEvent {
	public run() {
		this.writePoints([this.syncPerCoreLoad(), this.syncMem()]);

		return this.context.client.analytics!.writeApi.flush();
	}

	private syncPerCoreLoad() {
		const point = new Point(Points.PerCoreCPULoad).tag(Tags.Action, Actions.Sync);

		let index = 0;
		for (const { times } of cpus()) point.floatField(`cpu_${index++}`, (times.user + times.nice + times.sys + times.irq) / times.idle);

		return point;
	}

	private syncMem() {
		// TODO: Adjust for traditional sharding
		const usage = process.memoryUsage();
		return new Point(Points.Memory) //
			.tag(Tags.Action, Actions.Sync)
			.floatField('total', usage.heapTotal)
			.floatField('used', usage.heapUsed);
	}
}
