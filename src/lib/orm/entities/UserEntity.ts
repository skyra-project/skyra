import { kBigIntTransformer } from '@utils/util';
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { RpgUserEntity } from './RpgUserEntity';
import { UserCooldownEntity } from './UserCooldownEntity';
import { UserProfileEntity } from './UserProfileEntity';

@Entity('user', { schema: 'public' })
export class UserEntity extends BaseEntity {

	@PrimaryColumn('varchar', { length: 19 })
	public id!: string;

	@Column('integer', { 'default': 0 })
	public points = 0;

	@Column('integer', { 'default': 0 })
	public reputations = 0;

	@Column('boolean', { 'default': true })
	public moderationDM = true;

	@Column('bigint', { 'default': 0, 'transformer': kBigIntTransformer })
	public money = 0;

	@OneToOne(() => RpgUserEntity, rpgUsers => rpgUsers.user)
	public game?: RpgUserEntity;

	@OneToOne(() => UserProfileEntity, profile => profile.user, { cascade: true, eager: true })
	public profile?: UserProfileEntity;

	@OneToOne(() => UserCooldownEntity, cooldown => cooldown.user, { cascade: true, eager: true })
	public cooldowns?: UserCooldownEntity;

	@ManyToMany(() => UserEntity, { cascade: true })
	@JoinTable()
	public spouses?: UserEntity[];

	public get level() {
		return Math.floor(0.2 * Math.sqrt(this.points));
	}

}
