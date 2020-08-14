import { kBigIntTransformer } from '@utils/util';
import { BaseEntity, Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { RpgBattleEntity } from './RpgBattleEntity';
import { RpgClassEntity } from './RpgClassEntity';
import { RpgGuildEntity } from './RpgGuildEntity';
import { RpgGuildRankEntity } from './RpgGuildRankEntity';
import { RpgUserItemEntity } from './RpgUserItemEntity';
import { UserEntity } from './UserEntity';

@Check(/* sql */ `win_count >= 0`)
@Check(/* sql */ `death_count >= 0`)
@Check(/* sql */ `crate_common_count >= 0`)
@Check(/* sql */ `crate_uncommon_count >= 0`)
@Check(/* sql */ `crate_rare_count >= 0`)
@Check(/* sql */ `crate_legendary_count >= 0`)
@Check(/* sql */ `attack >= 1`)
@Check(/* sql */ `health >= 1`)
@Check(/* sql */ `agility >= 1`)
@Check(/* sql */ `energy >= 0`)
@Check(/* sql */ `luck >= 0`)
@Entity('rpg_user', { schema: 'public' })
export class RpgUserEntity extends BaseEntity {
	@Column('varchar', { length: 32 })
	public name!: string;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public winCount = 0;

	@Column('bigint', { default: 0, transformer: kBigIntTransformer })
	public deathCount = 0;

	@Column('integer', { default: 0 })
	public crateCommonCount = 0;

	@Column('integer', { default: 0 })
	public crateUncommonCount = 0;

	@Column('integer', { default: 0 })
	public crateRareCount = 0;

	@Column('integer', { default: 0 })
	public crateLegendaryCount = 0;

	@Column('integer')
	public attack!: number;

	@Column('integer')
	public health!: number;

	@Column('integer')
	public agility!: number;

	@Column('integer')
	public energy!: number;

	@Column('integer')
	public luck!: number;

	@OneToOne(() => RpgBattleEntity, (rpgBattles) => rpgBattles.challenged)
	public challengedAt?: RpgBattleEntity;

	@OneToOne(() => RpgBattleEntity, (rpgBattles) => rpgBattles.challenger)
	public challengerAt?: RpgBattleEntity;

	@OneToOne(() => RpgGuildEntity, (rpgGuilds) => rpgGuilds.leader)
	public leaderAt?: RpgGuildEntity;

	@OneToMany(() => RpgUserItemEntity, (rpgUserItems) => rpgUserItems.user)
	public items?: RpgUserItemEntity[];

	@ManyToOne(() => RpgClassEntity, (rpgClass) => rpgClass.users, { onDelete: 'SET NULL' })
	@JoinColumn()
	public class?: RpgClassEntity;

	@ManyToOne(() => RpgUserItemEntity, (rpgUserItems) => rpgUserItems.equippedBy, { onDelete: 'SET NULL' })
	@JoinColumn()
	public equippedItem?: RpgUserItemEntity;

	@ManyToOne(() => RpgGuildEntity, (rpgGuilds) => rpgGuilds.members, { onDelete: 'SET NULL' })
	@JoinColumn()
	public guild?: RpgGuildEntity;

	@ManyToOne(() => RpgGuildRankEntity, (rpgGuildRank) => rpgGuildRank.members, { onDelete: 'SET NULL' })
	@JoinColumn()
	public guildRank?: RpgGuildRankEntity;

	@OneToOne(() => UserEntity, (users) => users.game, { primary: true, onDelete: 'CASCADE' })
	@JoinColumn()
	public user?: UserEntity;
}
