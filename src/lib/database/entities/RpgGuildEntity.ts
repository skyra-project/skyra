import { kBigIntTransformer } from '@utils/util';
import { BaseEntity, Check, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RpgGuildRankEntity } from './RpgGuildRankEntity';
import { RpgUserEntity } from './RpgUserEntity';

@Check(/* sql */ `member_limit >= 5`)
@Check(/* sql */ `win_count >= 0`)
@Check(/* sql */ `lose_count >= 0`)
@Check(/* sql */ `money_count >= 0`)
@Check(/* sql */ `bank_limit >= 0`)
@Check(/* sql */ `upgrade >= 0`)
@Entity('rpg_guild', { schema: 'public' })
export class RpgGuildEntity extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'integer' })
	public id!: number;

	@Column('varchar', { length: 50 })
	public name!: string;

	@Column('varchar', { nullable: true, length: 200 })
	public description!: string | null;

	@Column('smallint', { default: 5 })
	public memberLimit = 5;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public winCount = 0;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public loseCount = 0;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public moneyCount = 0;

	@Column('bigint', { default: 50000, transformer: kBigIntTransformer })
	public bankLimit = 50000;

	@Column('smallint')
	public upgrade = 0;

	@OneToOne(() => RpgUserEntity, (rpgUsers) => rpgUsers.leaderAt, { onDelete: 'CASCADE' })
	@JoinColumn()
	public leader?: RpgUserEntity;

	@OneToMany(() => RpgGuildRankEntity, (rank) => rank.guild)
	public ranks?: RpgGuildRankEntity[];

	@OneToMany(() => RpgUserEntity, (rpgUsers) => rpgUsers.guild)
	public members?: RpgUserEntity[];
}
