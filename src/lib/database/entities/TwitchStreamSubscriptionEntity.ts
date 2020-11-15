import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('twitch_stream_subscription', { schema: 'public' })
export class TwitchStreamSubscriptionEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 16 })
	public id!: string;

	@Column('boolean')
	public isStreaming!: boolean;

	@Column('timestamp without time zone')
	public expiresAt!: Date;

	@Column('varchar', { array: true, length: 19, default: () => 'ARRAY[]::VARCHAR[]' })
	public guildIds: string[] = [];
}
