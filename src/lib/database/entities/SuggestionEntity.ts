import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('suggestion', { schema: 'public' })
export class SuggestionEntity extends BaseEntity {
	@PrimaryColumn('integer')
	public id!: number;

	@PrimaryColumn('varchar', { length: 19 })
	public guildId!: string;

	@Column('varchar', { length: 19 })
	public messageId!: string;

	@Column('varchar', { length: 19 })
	public authorId!: string;
}
