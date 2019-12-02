import { Event } from 'klasa';
import { ENABLE_INFLUX } from '../../../config';
import { mergeDefault } from '@klasa/utils';
import { IWriteOptions, IPoint } from 'influx';

export default abstract class AuditEvent extends Event {

	// eslint-disable-next-line @typescript-eslint/require-await
	public async init() {
		if (!ENABLE_INFLUX) this.disable();
	}

	protected writePoints(points: IPoint[], options?: IWriteOptions): Promise<void> {
		return this.client.influx!.writePoints(points, options);
	}

	protected formTags<T extends object>(tags: T) {
		return mergeDefault(this.getDefaultTags(), tags);
	}

	protected getDefaultTags() {
		return {
			shard: (this.client.options.shards as number[])[0].toString()
		};
	}

}
