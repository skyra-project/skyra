import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('banner', { schema: 'public' })
export class BannerEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 6 })
	public id!: string;

	@Column('varchar', { length: 32 })
	public group!: string;

	@Column('varchar', { length: 128 })
	public title!: string;

	@Column('varchar', { length: 19 })
	public authorId!: string;

	@Column('integer')
	public price!: number;
}
