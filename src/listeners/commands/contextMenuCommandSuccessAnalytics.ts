import type { SkyraCommand } from '#lib/structures';
import { Events as SkyraEvents } from '#lib/types';
import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, type ContextMenuCommandSuccessPayload } from '@sapphire/framework';

@ApplyOptions<Listener.Options>({ event: Events.ContextMenuCommandSuccess })
export class UserListener extends Listener<typeof Events.ContextMenuCommandSuccess> {
	public run(payload: ContextMenuCommandSuccessPayload) {
		const command = payload.command as SkyraCommand;
		this.container.client.emit(SkyraEvents.CommandUsageAnalytics, command.name, command.category);
	}
}
