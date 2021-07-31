import type { GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUserMessageSocialPointsAddUser })
export class UserListener extends Listener {
	public async run(message: GuildMessage, points: number) {
		const { users } = this.container.db;
		await users.lock([message.author.id], async (id) => {
			const user = await users.ensure(id);
			user.points += points;
			await user.save();
		});
	}
}
