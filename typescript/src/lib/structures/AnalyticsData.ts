import { envParseBoolean, envParseString } from '#lib/env';
import { parseAnalytics } from '#root/config';
import { InfluxDB, QueryApi, WriteApi } from '@influxdata/influxdb-client';

export class AnalyticsData {
	public influx: InfluxDB | null = envParseBoolean('INFLUX_ENABLED') ? new InfluxDB(parseAnalytics()) : null;

	public writeApi!: WriteApi;
	public queryApi!: QueryApi;

	public messageCount = 0;

	public constructor() {
		this.writeApi = this.influx!.getWriteApi(envParseString('INFLUX_ORG'), envParseString('INFLUX_ORG_ANALYTICS_BUCKET'), 's');
		this.queryApi = this.influx!.getQueryApi(envParseString('INFLUX_ORG'));
	}
}
