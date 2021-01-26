import { SkyraCommand } from '#lib/structures';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { CommandSuccessPayload, Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.CommandSuccess })
export class UserEvent extends Event<Events.CommandSuccess> {
	public run(payload: CommandSuccessPayload) {
		const command = payload.command as SkyraCommand;
		this.context.client.emit(Events.CommandUsageAnalytics, command.name, command.category, command.subCategory);
	}
}
