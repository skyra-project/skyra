import { Point } from '@influxdata/influxdb-client';
import { DbSet } from '@lib/structures/DbSet';
import { Events } from '@lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { AnalyticsSchema } from '@utils/Tracking/Analytics/AnalyticsSchema';
import { AnalyticsEvent } from '@utils/Tracking/Analytics/structures/AnalyticsEvent';
import { EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({
	event: Events.AnalyticsSync
})
export default class extends AnalyticsEvent {
	public async run(guilds: number, users: number) {
		const dbSet = await DbSet.connect();
		const [economyHealth, twitchSubscriptionCount] = await Promise.all([this.fetchEconomyHealth(dbSet), dbSet.twitchStreamSubscriptions.count()]);

		this.writePoints([
			this.syncGuilds(guilds),
			this.syncUsers(users),
			this.syncVoiceConnections(),
			this.syncEconomy(economyHealth.total_money, AnalyticsSchema.EconomyType.Money),
			this.syncEconomy(economyHealth.total_vault, AnalyticsSchema.EconomyType.Vault),
			this.syncTwitchSubscriptions(twitchSubscriptionCount),
			this.syncMessageCount()
		]);

		return this.client.analytics!.writeApi.flush();
	}

	private syncGuilds(value: number) {
		return (
			new Point(AnalyticsSchema.Points.Guilds)
				.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
				// TODO: Adjust for traditional sharding
				.intField('value', value)
		);
	}

	private syncUsers(value: number) {
		return (
			new Point(AnalyticsSchema.Points.Users)
				.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
				// TODO: Adjust for traditional sharding
				.intField('value', value)
		);
	}

	private syncVoiceConnections() {
		return (
			new Point(AnalyticsSchema.Points.VoiceConnections)
				.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
				// TODO: Adjust for traditional sharding
				.intField('value', this.client.audio.queues?.reduce((acc, queue) => (queue.player.playing ? acc + 1 : acc), 0) ?? 0)
		);
	}

	private syncEconomy(value: string, type: AnalyticsSchema.EconomyType) {
		return new Point(AnalyticsSchema.Points.Economy)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			.tag(AnalyticsSchema.Tags.ValueType, AnalyticsSchema.EconomyValueType.Size)
			.intField(type, Number(value));
	}

	private syncTwitchSubscriptions(value: number) {
		return new Point(AnalyticsSchema.Points.TwitchSubscriptions)
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			.intField('count', value);
	}

	private syncMessageCount() {
		const value = this.client.analytics!.messageCount;
		this.client.analytics!.messageCount = 0;

		return new Point(AnalyticsSchema.Points.MessageCount) //
			.tag(AnalyticsSchema.Tags.Action, AnalyticsSchema.Actions.Sync)
			.intField('value', value);
	}

	private async fetchEconomyHealth(dbSet: DbSet): Promise<{ total_money: string; total_vault: string }> {
		const [data] = await dbSet.users.query(/* sql */ `
			WITH
				u AS (SELECT SUM(money) as total_money FROM public.user),
				v AS (SELECT SUM(vault) as total_vault FROM public.user_profile)
			SELECT * FROM u, v;
		`);
		return data;
	}
}
