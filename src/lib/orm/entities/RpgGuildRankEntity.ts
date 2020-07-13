import { BaseEntity, Column, Entity, JoinColumn, OneToMany, PrimaryGeneratedColumn, Check } from 'typeorm';
import { RpgGuildEntity } from './RpgGuildEntity';
import { RpgUserEntity } from './RpgUserEntity';

@Check(/* sql */`name <> ''`)
@Entity('rpg_guild_rank', { schema: 'public' })
export class RpgGuildRankEntity extends BaseEntity {

	@PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
	public id!: number;

	@Column('varchar', { length: 50 })
	public name!: string;

	@OneToMany(() => RpgGuildEntity, guild => guild.ranks, { onDelete: 'CASCADE' })
	@JoinColumn()
	public guild?: RpgGuildEntity;

	@OneToMany(() => RpgUserEntity, rpgUsers => rpgUsers.guildRank)
	public members?: RpgUserEntity[];

}
