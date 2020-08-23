import { BaseEntity, Entity, JoinColumn, ManyToOne, Column, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('user_game_integration', { schema: 'public' })
export class UserGameIntegrationEntity<T> extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id!: number;

	@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: UserEntity;

	@Column('varchar', { length: 35 })
	public game!: string;

	@Column('jsonb')
	public extraData?: T;
}
