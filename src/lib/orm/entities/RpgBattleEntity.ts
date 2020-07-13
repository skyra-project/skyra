import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, Check } from 'typeorm';
import { RpgUserEntity } from './RpgUserEntity';
import { RpgUserItemEntity } from './RpgUserItemEntity';

@Check(/* sql */`challenger_cooldown >= 0`)
@Check(/* sql */`challenger_health >= 0`)
@Check(/* sql */`challenger_energy >= 0`)
@Check(/* sql */`challenged_cooldown >= 0`)
@Check(/* sql */`challenged_health >= 0`)
@Check(/* sql */`challenged_energy >= 0`)
@Entity('rpg_battle', { schema: 'public' })
export class RpgBattleEntity extends BaseEntity {

	@PrimaryGeneratedColumn({ type: 'bigint' })
	public id!: string;

	@Column('boolean')
	public challengerTurn?: boolean;

	@Column('smallint', { 'default': 0 })
	public challengerCooldown = 0;

	@Column('integer')
	public challengerHealth?: number;

	@Column('integer')
	public challengerEnergy?: number;

	@Column('jsonb', { 'default': {} })
	public challengerEffects: unknown = [];

	@Column('smallint', { 'default': 0 })
	public challengedCooldown = 0;

	@Column('integer')
	public challengedHealth?: number;

	@Column('integer')
	public challengedEnergy?: number;

	@Column('jsonb', { 'default': {} })
	public challengedEffects: unknown = [];

	@OneToOne(() => RpgUserEntity, rpgUsers => rpgUsers.challengedAt)
	@JoinColumn()
	public challenged?: RpgUserEntity;

	@ManyToOne(() => RpgUserItemEntity, rpgUserItems => rpgUserItems.challengedAt, { onDelete: 'SET NULL' })
	@JoinColumn()
	public challengedWeapon?: RpgUserItemEntity;

	@OneToOne(() => RpgUserEntity, rpgUsers => rpgUsers.challengerAt)
	@JoinColumn()
	public challenger?: RpgUserEntity;

	@ManyToOne(() => RpgUserItemEntity, rpgUserItems => rpgUserItems.challengerAt, { onDelete: 'SET NULL' })
	@JoinColumn()
	public challengerWeapon?: RpgUserItemEntity;

}
