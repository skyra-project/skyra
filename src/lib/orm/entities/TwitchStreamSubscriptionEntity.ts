import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('twitch_stream_subscription', { schema: 'public' })
export class TwitchStreamSubscriptionEntity extends BaseEntity {

	@PrimaryColumn('varchar', { length: 16 })
	public id!: string;

	@Column('boolean')
	public isStreaming!: boolean;

	// TODO: Write migration script for bigint -> timestamp without time zone
	@Column('timestamp without time zone')
	public expiresAt!: Date;

	@Column('varchar', { 'array': true, 'default': () => 'ARRAY[]::VARCHAR[]' })
	public guildIds: string[] = [];

}
