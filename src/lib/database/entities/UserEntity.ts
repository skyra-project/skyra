import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('user', { schema: 'public' })
export class UserEntity extends BaseEntity {
	@PrimaryColumn('varchar', { length: 19 })
	public id!: string;

	@Column('boolean', { default: true })
	public moderationDM = true;
}
