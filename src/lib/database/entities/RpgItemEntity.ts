import { BaseEntity, Check, Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RpgUserItemEntity } from './RpgUserItemEntity';

@Check(/* sql */ `name <> ''`)
@Check(/* sql */ `maximum_durability >= 0`)
@Check(/* sql */ `maximum_cooldown >= 0`)
@Check(/* sql */ `attack >= 0`)
@Check(/* sql */ `defense >= 0`)
@Check(/* sql */ `health >= 0`)
@Check(/* sql */ `required_energy >= 0`)
@Check(/* sql */ `rarity >= 1`)
@Check(/* sql */ `accuracy >= 0`)
@Check(/* sql */ `accuracy <= 100`)
@Index(['name', 'rarity'], { unique: true })
@Entity('rpg_item', { schema: 'public' })
export class RpgItemEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('enum', { default: 'Weapon', enum: ['Weapon', 'Shield', 'Disposable', 'Special'] })
	public type!: 'Weapon' | 'Shield' | 'Disposable' | 'Special';

	@Column('varchar', { length: 50 })
	public name!: string;

	@Column('integer')
	public maximumDurability!: number;

	@Column('smallint')
	public maximumCooldown!: number;

	@Column('double precision')
	public attack!: number;

	@Column('double precision')
	public defense!: number;

	@Column('double precision')
	public health!: number;

	@Column('double precision')
	public requiredEnergy!: number;

	@Column('integer')
	public rarity!: number;

	@Column('smallint')
	public accuracy!: number;

	@Column('jsonb', { default: () => "'{}'::jsonb" })
	public effects: unknown = [];

	@OneToMany(() => RpgUserItemEntity, (rpgUserItems) => rpgUserItems.item)
	public userItems?: RpgUserItemEntity[];
}
