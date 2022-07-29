import type { SkyraCommand } from '#lib/structures';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandSuccessPayload, Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: Events.CommandSuccess })
export class UserListener extends Listener<Events.CommandSuccess> {
	public run(payload: CommandSuccessPayload) {
		const command = payload.command as SkyraCommand;
		this.container.client.emit(Events.CommandUsageAnalytics, command.name, command.category);
	}
}
