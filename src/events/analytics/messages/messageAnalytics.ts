import { AnalyticsEvent } from '#lib/structures/events/AnalyticsEvent';

export default class extends AnalyticsEvent {
	public run(): void {
		this.client.analytics!.messageCount++;
	}
}
