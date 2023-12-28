import { TwitchSubscriptionEntity } from '#lib/database/entities/TwitchSubscriptionEntity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';

@Entity('guild_subscription', { schema: 'public' })
export class GuildSubscriptionEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19 })
	public guildId!: string;

	@ManyToOne(() => TwitchSubscriptionEntity, (twitchSubscription) => twitchSubscription.id, { cascade: true, eager: true })
	@JoinColumn()
	public subscription!: Relation<TwitchSubscriptionEntity>;

	@PrimaryColumn('varchar', { length: 19 })
	public channelId!: string;

	@Column('varchar', { nullable: true, length: 200 })
	public message?: string;
}
