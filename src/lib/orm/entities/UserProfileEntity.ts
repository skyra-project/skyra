import { kBigIntTransformer } from '@utils/util';
import { BaseEntity, Check, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { UserEntity } from './UserEntity';

@Check(/* sql */ `(color >= 0) AND (color <= 16777215)`)
@Entity('user_profile', { schema: 'public' })
export class UserProfileEntity extends BaseEntity {
	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public banners: string[] = [];

	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public publicBadges: string[] = [];

	@Column('varchar', { array: true, default: () => 'ARRAY[]::VARCHAR[]' })
	public badges: string[] = [];

	@Column('integer', { default: 0 })
	public color = 0x000000;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public vault = 0;

	@Column('varchar', { length: 6, default: '1001' })
	public bannerLevel = '1001';

	@Column('varchar', { length: 6, default: '0001' })
	public bannerProfile = '0001';

	@Column('boolean', { default: false })
	public darkTheme = false;

	@OneToOne(() => UserEntity, { primary: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: UserEntity;
}
