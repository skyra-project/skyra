import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RpgBattleEntity } from './RpgBattleEntity';
import { RpgItemEntity } from './RpgItemEntity';
import { RpgUserEntity } from './RpgUserEntity';

@Entity('rpg_user_item', { schema: 'public' })
export class RpgUserItemEntity extends BaseEntity {

	@PrimaryGeneratedColumn({ type: 'bigint' })
	public id!: string;

	@Column('bigint')
	public durability!: string;

	@OneToMany(() => RpgBattleEntity, rpgBattles => rpgBattles.challengedWeapon)
	public challengedAt?: RpgBattleEntity[];

	@OneToMany(() => RpgBattleEntity, rpgBattles => rpgBattles.challengerWeapon)
	public challengerAt?: RpgBattleEntity[];

	@ManyToOne(() => RpgItemEntity, rpgItems => rpgItems.userItems, { onDelete: 'CASCADE' })
	@JoinColumn()
	public item?: RpgItemEntity;

	@ManyToOne(() => RpgUserEntity, rpgUsers => rpgUsers.items, { onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: RpgUserEntity;

	@OneToMany(() => RpgUserEntity, rpgUsers => rpgUsers.equippedItem)
	public equippedBy?: RpgUserEntity[];

}
