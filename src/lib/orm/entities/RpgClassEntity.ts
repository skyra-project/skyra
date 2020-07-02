import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RpgUserEntity } from './RpgUserEntity';

@Entity('rpg_class', { schema: 'public' })
export class RpgClassEntity extends BaseEntity {

	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('varchar', { unique: true, length: 20 })
	public name?: string;

	@Column('double precision', { 'default': 1.0 })
	public attackMultiplier = 1.0;

	@Column('double precision', { 'default': 1.0 })
	public defenseMultiplier = 1.0;

	@Column('double precision', { 'default': 1.0 })
	public agilityMultiplier = 1.0;

	@Column('double precision', { 'default': 1.0 })
	public energyMultiplier = 1.0;

	@Column('double precision', { 'default': 1.0 })
	public luckMultiplier = 1.0;

	@OneToMany(() => RpgUserEntity, rpgUsers => rpgUsers.class)
	public users?: RpgUserEntity[];

}
