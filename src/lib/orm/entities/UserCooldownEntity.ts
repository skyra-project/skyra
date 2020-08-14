import { BaseEntity, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('user_cooldown', { schema: 'public' })
export class UserCooldownEntity extends BaseEntity {
	@Column('timestamp without time zone', { nullable: true })
	public daily: Date | null = null;

	@Column('timestamp without time zone', { nullable: true })
	public reputation: Date | null = null;

	@OneToOne(() => UserEntity, { primary: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: UserEntity;
}
