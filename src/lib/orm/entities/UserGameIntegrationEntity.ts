import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './UserEntity';

@Entity('user_game_integration', { schema: 'public' })
export class UserGameIntegrationEntity extends BaseEntity {
	@PrimaryGeneratedColumn()
	public id!: number;

	@ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: UserEntity;

	@Column('varchar', { length: 35 })
	public game!: string;

	@Column('jsonb')
	public extraData!: unknown;
}
