import type { Difference, GuildMessage } from '#lib/types';
import { Events } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Event, EventOptions } from '@sapphire/framework';

@ApplyOptions<EventOptions>({ event: Events.GuildUserMessageSocialPointsAddMember })
export class UserEvent extends Event {
	public async run(message: GuildMessage, add: number) {
		const difference = await this.addPoints(message.author.id, message.guild.id, add);
		this.context.client.emit(Events.GuildUserMessageSocialPointsAddMemberReward, message, difference);
	}

	private async addPoints(userID: string, guildID: string, points: number): Promise<Difference<number>> {
		const member = await this.context.db.members.ensure(userID, guildID);

		const previous = member.points ?? 0;
		const next = previous + points;

		member.points = next;
		await member.save();

		return { previous, next };
	}
}
