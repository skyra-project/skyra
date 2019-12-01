import { Client } from 'discord.js';
import { InfluxDB } from 'influx';
import { enumerable } from './util';
import { INFLUX_ANALYTICS_HOST, INFLUX_ANALYTICS_PORT, INFLUX_ANALYTICS_DATABASE, INFLUX_ANALYTICS_PASSWORD, INFLUX_ANALYTICS_USERNANE } from '../../../config';

export class AnalyticsHandler {

	public readonly influx: InfluxDB = new InfluxDB({
		host: INFLUX_ANALYTICS_HOST,
		port: INFLUX_ANALYTICS_PORT,
		username: INFLUX_ANALYTICS_USERNANE,
		password: INFLUX_ANALYTICS_PASSWORD,
		database: INFLUX_ANALYTICS_DATABASE
	});

	@enumerable(false)
	private readonly client: Client;

	public constructor(client: Client) {
		this.client = client;
	}

}
