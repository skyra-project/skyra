import { BaseEntity, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('user_game_integrations', { schema: 'public' })
export class UserGameIntegrationsEntity extends BaseEntity {
	@OneToOne(() => UserEntity, { primary: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: UserEntity;
}
