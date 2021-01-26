import { AnalyticsEvent } from '#lib/structures';
import { AnalyticsSchema } from '#lib/types/AnalyticsSchema';
import { Events } from '#lib/types/Enums';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@sapphire/decorators';
import type { EventOptions } from '@sapphire/framework';
import type { Guild } from 'discord.js';

@ApplyOptions<EventOptions>({ event: Events.GuildCreate })
export class UserAnalyticsEvent extends AnalyticsEvent {
	public run(guild: Guild) {
		const guilds = new Point(AnalyticsSchema.Points.Guilds)
			.tag(AnalyticsSchema.Tags.Shard, guild.shardID.toString())
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Addition)
			// TODO: Adjust for traditional sharding
			.intField('value', guild.client.guilds.cache.size);
		const users = new Point(AnalyticsSchema.Points.Users)
			.tag(AnalyticsSchema.Tags.Shard, guild.shardID.toString())
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Addition)
			// TODO: Adjust for traditional sharding
			.intField(
				'value',
				guild.client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
			);

		return this.writePoints([guilds, users]);
	}
}
