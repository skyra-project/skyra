import { Events } from '#lib/types/Enums';
import { AnalyticsSchema } from '#utils/Tracking/Analytics/AnalyticsSchema';
import { AnalyticsEvent } from '#utils/Tracking/Analytics/structures/AnalyticsEvent';
import { Point } from '@influxdata/influxdb-client';
import { ApplyOptions } from '@skyra/decorators';
import { Guild } from 'discord.js';
import { EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({
	event: Events.GuildCreate
})
export default class extends AnalyticsEvent {
	public run(guild: Guild) {
		const guilds = new Point(AnalyticsSchema.Points.Guilds)
			.tag(AnalyticsSchema.Tags.Shard, guild.shardID.toString())
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Addition)
			// TODO: Adjust for traditional sharding
			.intField('value', this.client.guilds.cache.size);
		const users = new Point(AnalyticsSchema.Points.Users)
			.tag(AnalyticsSchema.Tags.Shard, guild.shardID.toString())
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Addition)
			// TODO: Adjust for traditional sharding
			.intField(
				'value',
				this.client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
			);

		return this.writePoints([guilds, users]);
	}
}
