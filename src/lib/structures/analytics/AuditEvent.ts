import { IWriteOptions } from 'influx';
import { Databases } from '../../types/influxSchema/database';
import BaseAnalyticsEvent from './BaseAnalyticsEvent';
import { mergeDefault } from '@klasa/utils';

export default abstract class AuditEvent extends BaseAnalyticsEvent {

	protected getDefaultOptions(): IWriteOptions {
		return mergeDefault(super.getDefaultOptions(), {
			database: Databases.Audits
		});
	}

}
