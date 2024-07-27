import { parseAnalytics } from '#root/config';
import { InfluxDB, type QueryApi, type WriteApi } from '@influxdata/influxdb-client';
import { envParseString } from '@skyra/env-utilities';

export class AnalyticsData {
	public readonly influx: InfluxDB = new InfluxDB(parseAnalytics());
	public readonly writeApi: WriteApi;
	public readonly queryApi: QueryApi;

	public messageCount = 0;

	public constructor() {
		this.writeApi = this.influx.getWriteApi(envParseString('INFLUX_ORG'), envParseString('INFLUX_ORG_ANALYTICS_BUCKET'), 's');
		this.queryApi = this.influx.getQueryApi(envParseString('INFLUX_ORG'));
	}
}
