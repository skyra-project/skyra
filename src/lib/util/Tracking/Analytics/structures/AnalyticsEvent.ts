import { Event } from 'klasa';
import { ENABLE_INFLUX } from '@root/config';
import { WriteApi, Point } from '@influxdata/influxdb-client';
import { enumerable } from '@utils/util';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';

export abstract class AnalyticsEvent extends Event {

	public analytics!: WriteApi;

	@enumerable(false)
	public tags: [AnalyticsSchema.Tags, string][] = [];

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) return this.disable();
		this.analytics = this.client.analytics!;
		this.initTags();
	}

	public writePoint(point: Point) {
		return this.analytics.writePoint(this.injectTags(point));
	}

	public writePoints(points: Point[]) {
		points = points.map(point => this.injectTags(point));
		return this.analytics.writePoints(points);
	}

	protected injectTags(point: Point) {
		for (const tag of this.tags) {
			point.tag(tag[0], tag[1]);
		}
		return point;
	}

	protected initTags() {
		this.tags.push([AnalyticsSchema.Tags.Client, this.client.user!.id]);
	}

}
