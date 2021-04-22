import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.GuildUserMessageSocialPointsAddUser })
export class UserEvent extends Event {
	public async run(message: GuildMessage, points: number) {
		const { users } = this.context.db;
		await users.lock([message.author.id], async (id) => {
			const user = await users.ensure(id);
			user.points += points;
			await user.save();
		});
	}
}
