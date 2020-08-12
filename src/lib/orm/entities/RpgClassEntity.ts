import { BaseEntity, Check, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RpgUserEntity } from './RpgUserEntity';

@Check(/* sql */ `name <> ''`)
@Check(/* sql */ `attack_multiplier >= 0`)
@Check(/* sql */ `defense_multiplier >= 0`)
@Check(/* sql */ `agility_multiplier >= 0`)
@Check(/* sql */ `energy_multiplier >= 0`)
@Check(/* sql */ `luck_multiplier >= 0`)
@Entity('rpg_class', { schema: 'public' })
export class RpgClassEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('varchar', { unique: true, length: 20 })
	public name!: string;

	@Column('double precision', { default: 1.0 })
	public attackMultiplier = 1.0;

	@Column('double precision', { default: 1.0 })
	public defenseMultiplier = 1.0;

	@Column('double precision', { default: 1.0 })
	public agilityMultiplier = 1.0;

	@Column('double precision', { default: 1.0 })
	public energyMultiplier = 1.0;

	@Column('double precision', { default: 1.0 })
	public luckMultiplier = 1.0;

	@OneToMany(() => RpgUserEntity, (rpgUsers) => rpgUsers.class)
	public users?: RpgUserEntity[];
}
