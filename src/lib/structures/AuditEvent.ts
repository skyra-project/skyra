import { Event } from 'klasa';
import { ENABLE_INFLUX } from '../../../config';
import { mergeDefault } from '@klasa/utils';
import { IWriteOptions, IPoint } from 'influx';
import { Databases } from '../types/influxSchema/database';

export default abstract class AuditEvent extends Event {

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) this.disable();
	}

	protected writePoint(measurement: string, points: IPoint[], options?: IWriteOptions): Promise<void> {
		return this.client.influx!.writeMeasurement(measurement, points, this.formOptions(options));
	}

	protected formTags<T extends object>(tags: T) {
		return mergeDefault(this.getDefaultTags(), tags);
	}

	protected formOptions<T extends object>(options?: T) {
		return mergeDefault(this.getDefaultOptions(), options);
	}

	protected getDefaultTags() {
		return {
			shard: (this.client.options.shards as number[])[0].toString()
		};
	}

	protected getDefaultOptions(): IWriteOptions {
		return {
			database: Databases.Audits
		}
	}

}
