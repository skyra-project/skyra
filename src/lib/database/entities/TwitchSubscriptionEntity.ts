import { GuildSubscriptionEntity } from '#lib/database/entities/GuildSubscriptionEntity';
import { TwitchEventSubTypes } from '@skyra/twitch-helpers';
import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, type Relation } from 'typeorm';

@Index(['streamerId', 'subscriptionType'], { unique: true })
@Entity('twitch_subscriptions', { schema: 'public' })
export class TwitchSubscriptionEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('varchar', { length: 10 })
	public streamerId!: string;

	@Column('varchar', { length: 36 })
	public subscriptionId!: string;

	@Column({ type: 'enum', enum: TwitchEventSubTypes })
	public subscriptionType!: TwitchEventSubTypes;

	@OneToMany(() => GuildSubscriptionEntity, (guildSubscription) => guildSubscription.subscription)
	public guildSubscription!: Relation<GuildSubscriptionEntity>[];
}
