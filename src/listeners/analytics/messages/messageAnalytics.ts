import { AnalyticsListener } from '#lib/structures';
import { Events } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<AnalyticsListener.Options>({ event: Events.MessageCreate })
export class UserAnalyticsEvent extends AnalyticsListener {
	public run(): void {
		this.container.client.analytics!.messageCount++;
	}
}
