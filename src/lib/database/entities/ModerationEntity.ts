import { kBigIntTransformer } from '#lib/database/utils/Transformers';
import type { TypeMetadata, TypeVariation } from '#utils/moderationConstants';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('moderation', { schema: 'public' })
export class ModerationEntity extends BaseEntity {
	@PrimaryColumn('integer')
	public caseId = -1;

	@Column('timestamp without time zone', { nullable: true, default: () => 'null' })
	public createdAt: Date | null = null;

	@Column('bigint', { nullable: true, default: () => 'null', transformer: kBigIntTransformer })
	public duration: number | null = null;

	@Column('json', { nullable: true, default: () => 'null' })
	public extraData: object | null = null;

	@PrimaryColumn('varchar', { length: 19 })
	public guildId: string = null!;

	@Column('varchar', { length: 19, default: process.env.CLIENT_ID })
	public moderatorId: string = process.env.CLIENT_ID;

	@Column('varchar', { nullable: true, length: 2000, default: () => 'null' })
	public reason: string | null = null;

	@Column('varchar', { nullable: true, length: 2000, default: () => 'null' })
	public imageURL: string | null = null;

	@Column('varchar', { nullable: true, length: 19, default: () => 'null' })
	public userId: string | null = null;

	@Column('smallint')
	public type!: TypeVariation;

	@Column('smallint')
	public metadata!: TypeMetadata;
}
