import { BaseEntity, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn, Check } from 'typeorm';
import { RpgUserItemEntity } from './RpgUserItemEntity';

@Check(/* sql */`name <> ''`)
@Check(/* sql */`maximum_durability >= 0`)
@Check(/* sql */`maximum_cooldown >= 0`)
@Check(/* sql */`attack >= 0`)
@Check(/* sql */`defense >= 0`)
@Check(/* sql */`health >= 0`)
@Check(/* sql */`required_energy >= 0`)
@Check(/* sql */`rarity >= 1`)
@Check(/* sql */`accuracy >= 0`)
@Check(/* sql */`accuracy <= 100`)
@Index(['name', 'rarity'], { unique: true })
@Entity('rpg_item', { schema: 'public' })
export class RpgItemEntity extends BaseEntity {

	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('enum', { 'default': 'Weapon', 'enum': ['Weapon', 'Shield', 'Disposable', 'Special'] })
	public type: 'Weapon' | 'Shield' | 'Disposable' | 'Special' = 'Weapon';

	@Column('varchar', { length: 50 })
	public name!: string;

	@Column('integer')
	public maximumDurability!: number;

	@Column('smallint', { 'default': 0 })
	public maximumCooldown = 0;

	@Column('double precision', { 'default': 0.0 })
	public attack = 0.0;

	@Column('double precision', { 'default': 0.0 })
	public defense = 0.0;

	@Column('double precision', { 'default': 0.0 })
	public health = 0.0;

	@Column('double precision', { 'default': 0.0 })
	public requiredEnergy = 0.0;

	@Column('integer')
	public rarity!: number;

	@Column('smallint', { 'default': 100 })
	public accuracy = 100;

	@Column('jsonb', { 'default': [] })
	public effects: unknown = [];

	@OneToMany(() => RpgUserItemEntity, rpgUserItems => rpgUserItems.item)
	public userItems?: RpgUserItemEntity[];

}
