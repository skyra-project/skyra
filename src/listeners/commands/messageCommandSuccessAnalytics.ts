import type { SkyraCommand } from '#lib/structures';
import { Events as SkyraEvents } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type MessageCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.MessageCommandSuccess })
export class UserListener extends Listener<typeof Events.MessageCommandSuccess> {
	public run(payload: MessageCommandSuccessPayload) {
		const command = payload.command as SkyraCommand;
		this.container.client.emit(SkyraEvents.CommandUsageAnalytics, command.name, command.category);
	}
}
