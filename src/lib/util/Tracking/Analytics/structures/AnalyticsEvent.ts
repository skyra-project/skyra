import { Point } from '@influxdata/influxdb-client';
import { CLIENT_ID, ENABLE_INFLUX } from '@root/config';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { enumerable } from '@utils/util';
import { Event } from 'klasa';

export abstract class AnalyticsEvent extends Event {
	@enumerable(false)
	public tags: [AnalyticsSchema.Tags, string][] = [];

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) {
			this.disable();
			return;
		}

		this.initTags();
	}

	public writePoint(point: Point) {
		return this.client.analytics!.writeApi.writePoint(this.injectTags(point));
	}

	public writePoints(points: Point[]) {
		points = points.map((point) => this.injectTags(point));
		return this.client.analytics!.writeApi.writePoints(points);
	}

	protected injectTags(point: Point) {
		for (const tag of this.tags) {
			point.tag(tag[0], tag[1]);
		}
		return point;
	}

	protected initTags() {
		this.tags.push([AnalyticsSchema.Tags.Client, CLIENT_ID], [AnalyticsSchema.Tags.OriginEvent, this.event]);
	}
}
