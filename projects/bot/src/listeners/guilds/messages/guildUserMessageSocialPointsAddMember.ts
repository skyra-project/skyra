import type { Difference, GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Listener, ListenerOptions } from '@sapphire/framework';

@ApplyOptions<ListenerOptions>({ event: Events.GuildUserMessageSocialPointsAddMember })
export class UserListener extends Listener {
	public async run(message: GuildMessage, add: number) {
		const difference = await this.addPoints(message.author.id, message.guild.id, add);
		this.container.client.emit(Events.GuildUserMessageSocialPointsAddMemberReward, message, difference);
	}

	private async addPoints(userId: string, guildId: string, points: number): Promise<Difference<number>> {
		const member = await this.container.db.members.ensure(userId, guildId);

		const previous = member.points ?? 0;
		const next = previous + points;

		member.points = next;
		await member.save();

		return { previous, next };
	}
}
