import type { TwitchSubscriptionTypes } from '#lib/types';
import { BaseEntity, Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('twitch_stream_subscription', { schema: 'public' })
@Unique('twitch_streamer_id_subscription_type', ['id', 'subscriptionType'])
export class TwitchStreamSubscriptionEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 16 })
	public id!: string;

	@PrimaryColumn('varchar')
	public subscriptionId!: string;

	@PrimaryColumn('varchar', { length: 14 })
	public subscriptionType!: TwitchSubscriptionTypes;

	@Column('timestamp without time zone')
	public expiresAt!: Date;

	@Column('varchar', { array: true, length: 19, default: () => 'ARRAY[]::VARCHAR[]' })
	public guildIds: string[] = [];
}
