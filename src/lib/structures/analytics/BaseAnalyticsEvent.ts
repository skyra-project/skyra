import { Event } from 'klasa';
import { ENABLE_INFLUX } from '@root/config';
import { mergeDefault } from '@klasa/utils';
import { IWriteOptions, IPoint, InfluxDB } from 'influx';
import { Tags } from '@lib/types/influxSchema/tags';

export default abstract class BaseAnalyticsEvent extends Event {

	public abstract DATABASE: string = '';
	public influx: InfluxDB = this.client.influx!;

	public async init() {
		if (!ENABLE_INFLUX) return this.disable();
		const DBsPresent = await this.influx.getDatabaseNames();
		if (!DBsPresent.includes(this.DATABASE)) await this.influx.createDatabase(this.DATABASE);
	}

	protected writeMeasurement(measurement: string, point: IPoint, options?: IWriteOptions) {
		return this.influx.writeMeasurement(measurement, [point], this.formOptions(options));
	}

	protected writeMeasurements(measurement: string, points: IPoint[], options?: IWriteOptions) {
		return this.influx.writeMeasurement(measurement, points, this.formOptions(options));
	}

	protected formTags(tags: object) {
		return mergeDefault(this.getDefaultTags(), tags);
	}

	protected formOptions(options?: IWriteOptions) {
		return mergeDefault(this.getDefaultOptions(), options);
	}

	protected getDefaultTags() {
		return {
			[Tags.Shard]: (this.client.options.shards as number[])[0].toString()
		};
	}

	protected getDefaultOptions(): IWriteOptions {
		return {
			database: this.DATABASE
		};
	}

}
