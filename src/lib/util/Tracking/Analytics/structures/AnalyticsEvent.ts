import { Point, QueryApi, WriteApi } from '@influxdata/influxdb-client';
import { CLIENT_ID, ENABLE_INFLUX } from '@root/config';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { enumerable } from '@utils/util';
import { Event } from 'klasa';

export abstract class AnalyticsEvent extends Event {
	public analytics!: WriteApi;
	public analyticsReader!: QueryApi;

	@enumerable(false)
	public tags: [AnalyticsSchema.Tags, string][] = [];

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) return this.disable();
		this.analytics = this.client.analytics!;
		this.analyticsReader = this.client.analyticsReader!;
		this.initTags();
	}

	public writePoint(point: Point) {
		return this.analytics.writePoint(this.injectTags(point));
	}

	public writePoints(points: Point[]) {
		points = points.map((point) => this.injectTags(point));
		return this.analytics.writePoints(points);
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
