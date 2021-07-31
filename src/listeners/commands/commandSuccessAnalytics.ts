import type { SkyraCommand } from '#lib/structures';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandSuccessPayload, Events, Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: Events.CommandSuccess })
export class UserListener extends Listener<typeof Events.CommandSuccess> {
	public run(payload: CommandSuccessPayload) {
		const command = payload.command as SkyraCommand;
		this.container.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
