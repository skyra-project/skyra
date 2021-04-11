import { BaseEntity, Check, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('banner', { schema: 'public' })
@Check(/* sql */ `"group"::text <> ''::text`)
@Check(/* sql */ `"title"::text <> ''::text`)
@Check(/* sql */ `"price" >= 0`)
export class BannerEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 6 })
	public id!: string;

	@Column('varchar', { length: 32 })
	public group!: string;

	@Column('varchar', { length: 128 })
	public title!: string;

	@Column('varchar', { length: 19 })
	public authorID!: string;

	@Column('integer')
	public price!: number;
}
