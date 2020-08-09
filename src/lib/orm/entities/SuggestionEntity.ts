import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('suggestion', { schema: 'public' })
export class SuggestionEntity extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@PrimaryColumn('varchar', { length: 19 })
	public guildID!: string;

	@Column('varchar', { length: 19 })
	public messageID!: string;

	@Column('varchar', { length: 19 })
	public authorID!: string;
}
