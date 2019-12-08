import { Event } from 'klasa';
import { ENABLE_INFLUX } from '../../../../config';
import { mergeDefault } from '@klasa/utils';
import { IWriteOptions, IPoint } from 'influx';
import { Tags } from '../../types/influxSchema/tags';

export default abstract class BaseAnalyticsEvent extends Event {

	public abstract DATABASE: string = '';

	public async init() {
		if (!ENABLE_INFLUX) return this.disable();
		const DBsPresent = await this.client.influx!.getDatabaseNames();
		if (!DBsPresent.includes(this.DATABASE)) await this.client.influx!.createDatabase(this.DATABASE);
	}

	protected writeMeasurement(measurement: string, points: IPoint, options?: IWriteOptions): Promise<void> {
		return this.client.influx!.writeMeasurement(measurement, [points], this.formOptions(options));
	}

	protected formTags<T extends object>(tags: T) {
		return mergeDefault(this.getDefaultTags(), tags);
	}

	protected formOptions<T extends object>(options?: T) {
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
