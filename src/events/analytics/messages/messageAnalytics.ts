import { AnalyticsEvent } from '#lib/structures';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.Message })
export default class extends AnalyticsEvent {
	public run(): void {
		this.context.client.analytics!.messageCount++;
	}
}
