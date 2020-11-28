import { ENABLE_INFLUX, INFLUX_OPTIONS, INFLUX_ORG, INFLUX_ORG_ANALYTICS_BUCKET } from '#root/config';
import { enumerable } from '#utils/util';
import { InfluxDB, QueryApi, WriteApi, WritePrecision } from '@influxdata/influxdb-client';

export class AnalyticsData {
	@enumerable(false)
	public influx: InfluxDB | null = ENABLE_INFLUX ? new InfluxDB(INFLUX_OPTIONS) : null;

	public writeApi!: WriteApi;
	public queryApi!: QueryApi;

	public messageCount = 0;

	public constructor() {
		this.writeApi = this.influx!.getWriteApi(INFLUX_ORG, INFLUX_ORG_ANALYTICS_BUCKET, WritePrecision.s);
		this.queryApi = this.influx!.getQueryApi(INFLUX_ORG);
	}
}
